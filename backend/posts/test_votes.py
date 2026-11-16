import pytest
from django.urls import reverse

from .models import Post, PostVote

pytestmark = pytest.mark.django_db


@pytest.fixture
def post(user):
    return Post.objects.create(author=user, title="Title", text="Text")


def vote(client, post, value):
    return client.put(reverse("post-vote", args=[post.pk]), {"value": value}, format="json")


def assert_counts(post, up, down):
    post.refresh_from_db()
    assert (post.upvotes, post.downvotes) == (up, down)
    # the counters must always match the vote rows
    assert PostVote.objects.filter(post=post, value=1).count() == up
    assert PostVote.objects.filter(post=post, value=-1).count() == down


def test_anonymous_user_cannot_vote(anon_client, post):
    res = vote(anon_client, post, 1)

    assert res.status_code == 403
    assert_counts(post, 0, 0)


def test_upvote_returns_updated_post(other_auth_client, post):
    res = vote(other_auth_client, post, 1)

    assert res.status_code == 200
    assert res.data["upvotes"] == 1
    assert res.data["downvotes"] == 0
    assert res.data["my_vote"] == 1
    assert_counts(post, 1, 0)


@pytest.mark.parametrize(
    "values, expected",
    [
        ([1, 1], (1, 0)),  # same vote twice is idempotent
        ([-1, -1], (0, 1)),
        ([1, -1], (0, 1)),  # switching moves the vote
        ([-1, 1], (1, 0)),
        ([1, 0], (0, 0)),  # 0 removes the vote
        ([-1, 0], (0, 0)),
        ([0], (0, 0)),  # removing a vote that doesn't exist is a no-op
        ([1, -1, 0, 1], (1, 0)),
    ],
)
def test_vote_sequences_keep_counters_in_sync(other_auth_client, post, values, expected):
    for value in values:
        assert vote(other_auth_client, post, value).status_code == 200

    assert_counts(post, *expected)


def test_votes_from_different_users_add_up(auth_client, other_auth_client, post):
    vote(auth_client, post, 1)
    res = vote(other_auth_client, post, 1)

    assert res.status_code == 200
    assert res.data["upvotes"] == 2
    assert res.data["downvotes"] == 0
    assert res.data["my_vote"] == 1
    assert_counts(post, 2, 0)


@pytest.mark.parametrize("value", [2, -2, "up", None])
def test_invalid_vote_value_is_rejected(other_auth_client, post, value):
    res = vote(other_auth_client, post, value)

    assert res.status_code == 400
    assert "value" in res.data["error"]["fields"]
    assert_counts(post, 0, 0)


def test_vote_on_missing_post_returns_404(other_auth_client):
    res = other_auth_client.put(reverse("post-vote", args=[999]), {"value": 1}, format="json")

    assert res.status_code == 404


def test_feed_shows_each_users_own_vote(anon_client, auth_client, other_auth_client, post):
    vote(other_auth_client, post, -1)

    assert other_auth_client.get(reverse("posts")).data["results"][0]["my_vote"] == -1
    assert auth_client.get(reverse("posts")).data["results"][0]["my_vote"] == 0
    assert anon_client.get(reverse("posts")).data["results"][0]["my_vote"] == 0
