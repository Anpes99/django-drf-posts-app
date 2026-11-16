from django.db import transaction
from django.db.models import F

from .models import Post, PostVote


def cast_vote(user, post_id, newVoteValue):
    """Set `user`'s vote on a post to 1 (up), -1 (down) or 0 (no vote).

    Locks the post row so concurrent votes (e.g. a double-click) can't corrupt the counters.
    Raises Post.DoesNotExist if there is no such post.
    """
    with transaction.atomic():
        post = Post.objects.select_for_update().only('pk').get(pk=post_id)
        existing = PostVote.objects.filter(user=user, post=post).first()
        old = existing.value if existing else 0
        if old == newVoteValue:
            return  # same vote again: nothing to change

        if newVoteValue == 0:
            existing.delete()
        elif existing:
            existing.value = newVoteValue
            existing.save(update_fields=['value'])
        else:
            PostVote.objects.create(user=user, post=post, value=newVoteValue)

        # Update the counters: take back the old vote, then add the new one.
        up_change = 0
        down_change = 0

        if old == PostVote.Value.UP:   
            up_change -= 1
        elif old == PostVote.Value.DOWN:
            down_change -= 1

        if newVoteValue == PostVote.Value.UP:
            up_change += 1
        elif newVoteValue == PostVote.Value.DOWN:
            down_change += 1

        Post.objects.filter(pk=post.pk).update(
            upvotes=F('upvotes') + up_change,
            downvotes=F('downvotes') + down_change,
        )
