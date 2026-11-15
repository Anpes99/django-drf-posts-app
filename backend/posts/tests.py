import pytest
from django.urls import reverse

from .models import Post

pytestmark = pytest.mark.django_db


@pytest.fixture
def post(user):
    return Post.objects.create(author=user, title="Original title", text="Original text")


def detail_url(post):
    return reverse("post-detail", args=[post.pk])


# --- anonymous users: read-only ---


def test_anonymous_user_can_list_posts(api_client, post):
    res = api_client.get(reverse("posts"))

    assert res.status_code == 200
    assert res.data["results"][0]["id"] == post.pk


def test_anonymous_user_cannot_create_post(api_client):
    res = api_client.post(reverse("posts"), {"title": "test title1", "text": "test text1"})

    assert res.status_code == 403
    assert Post.objects.count() == 0


def test_anonymous_user_cannot_update_post(api_client, post):
    res = api_client.patch(detail_url(post), {"text": "test update text1"})

    assert res.status_code == 403
    post.refresh_from_db()
    assert post.text == "Original text"


def test_anonymous_user_cannot_delete_post(api_client, post):
    res = api_client.delete(detail_url(post))

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

