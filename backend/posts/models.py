from django.conf import settings
from django.db import models
from django.db.models import OuterRef, Subquery, Value
from django.db.models.functions import Coalesce


class PostQuerySet(models.QuerySet):
    def with_my_vote(self, user):
        """Annotate `my_vote` (1, -1 or 0) for `user`, as one subquery in the same SQL query."""
        if not user.is_authenticated:
            return self.annotate(my_vote=Value(0))
        vote = PostVote.objects.filter(post=OuterRef('pk'), user=user).values('value')[:1]
        return self.annotate(my_vote=Coalesce(Subquery(vote), 0))


class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    text = models.TextField(max_length=10000)
    created_at = models.DateTimeField(auto_now_add=True)
    upvotes = models.PositiveIntegerField(default=0)
    downvotes = models.PositiveIntegerField(default=0)

    objects = PostQuerySet.as_manager()


class PostVote(models.Model):
    class Value(models.IntegerChoices):
        UP = 1
        DOWN = -1

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='votes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='votes')
    value = models.SmallIntegerField(choices=Value.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='one_vote_per_user_per_post'),
            models.CheckConstraint(condition=models.Q(value__in=[1, -1]), name='vote_value_valid'),
        ]
