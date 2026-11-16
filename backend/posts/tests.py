import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Post
from .services import cast_vote

pytestmark = pytest.mark.django_db


@pytest.fixture
def post(user):
    return Post.objects.create(author=user, title="Original title", text="Original text")


def detail_url(post):
    return reverse("post-detail", args=[post.pk])


# --- anonymous users: read-only ---


def test_anonymous_user_can_list_posts(anon_client, post):
    res = anon_client.get(reverse("posts"))

    assert res.status_code == 200
    assert res.data["results"][0]["id"] == post.pk


def test_anonymous_user_cannot_create_post(anon_client):
    res = anon_client.post(reverse("posts"), {"title": "test title1", "text": "test text1"})

    assert res.status_code == 403
    assert Post.objects.count() == 0


def test_anonymous_user_cannot_update_post(anon_client, post):
    res = anon_client.patch(detail_url(post), {"text": "test update text1"})

    assert res.status_code == 403
    post.refresh_from_db()
    assert post.text == "Original text"


def test_anonymous_user_cannot_delete_post(anon_client, post):
    res = anon_client.delete(detail_url(post))

    assert res.status_code == 403
    assert Post.objects.filter(pk=post.pk).exists()


# --- logged-in users ---


def test_logged_in_user_creates_post_as_author(auth_client, user):
    res = auth_client.post(reverse("posts"), {"title": "new post title1", "text": "new post text1"})

    assert res.status_code == 201
    assert res.data["author"] == user.username
    assert Post.objects.get().author == user


# --- logged-in users who aren't the author ---


def test_non_author_cannot_update_post(other_auth_client, post):
    res = other_auth_client.patch(detail_url(post), {"text": "test update text1"})

    assert res.status_code == 403
    post.refresh_from_db()
    assert post.text == "Original text"


def test_non_author_cannot_delete_post(other_auth_client, post):
    res = other_auth_client.delete(detail_url(post))

    assert res.status_code == 403
    assert Post.objects.filter(pk=post.pk).exists()


# --- the author ---


def test_author_can_update_own_post(auth_client, post):
    res = auth_client.patch(detail_url(post), {"text": "new text updated1"})

    assert res.status_code == 200
    assert res.data["text"] == "new text updated1"
    post.refresh_from_db()
    assert post.text == "new text updated1"


def test_author_can_delete_own_post(auth_client, post):
    res = auth_client.delete(detail_url(post))

    assert res.status_code == 204
    assert not Post.objects.filter(pk=post.pk).exists()


def test_author_cannot_delete_post_without_csrf_token(user, post):
    # Session cookie present, no X-CSRFToken header.
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)

    res = client.delete(detail_url(post))

    assert res.status_code == 403
    assert Post.objects.filter(pk=post.pk).exists()


# --- performance ---


def test_feed_query_count_does_not_grow_with_posts(other_auth_client, user, other_user, django_assert_num_queries):
    for i in range(5):
        p = Post.objects.create(author=user, title=f"t{i}", text="x")
        cast_vote(other_user, p.pk, 1)

    # one COUNT for pagination + one SELECT with author join and my_vote subquery
    with django_assert_num_queries(2):
        res = other_auth_client.get(reverse("posts"))

    assert [p["my_vote"] for p in res.data["results"]] == [1] * 5
