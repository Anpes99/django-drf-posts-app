import pytest
from django.urls import reverse

from .models import Comment, Post
from .pagination import CommentPagination

pytestmark = pytest.mark.django_db


@pytest.fixture
def post(user):
    return Post.objects.create(author=user, title="Title", text="Text")


def comments_url(post_id):
    return reverse("post-comments", args=[post_id])


def test_anonymous_user_can_list_comments(anon_client, post, other_user):
    Comment.objects.create(post=post, author=other_user, text="commenttext1")

    res = anon_client.get(comments_url(post.pk))

    assert res.status_code == 200
    assert res.data["results"][0]["text"] == "commenttext1"
    assert res.data["results"][0]["author"] == other_user.username


def test_anonymous_user_cannot_comment(anon_client, post):
    res = anon_client.post(comments_url(post.pk), {"text": "commenttext1"})

    assert res.status_code == 403
    assert not Comment.objects.exists()


def test_logged_in_user_comments_as_author_of_the_comment(other_auth_client, other_user, post):
    res = other_auth_client.post(comments_url(post.pk), {"text": "commenttext1"})

    assert res.status_code == 201
    assert res.data["author"] == other_user.username
    comment = Comment.objects.get()
    assert (comment.post, comment.author, comment.text) == (post, other_user, "commenttext1")


def test_author_and_post_cannot_be_set_by_client(other_auth_client, other_user, user, post):
    other_post = Post.objects.create(author=user, title="Other", text="x")

    other_auth_client.post(comments_url(post.pk), {"text": "commenttext1", "author": user.pk, "post": other_post.pk})

    comment = Comment.objects.get()
    assert comment.post == post
    assert comment.author == other_user


@pytest.mark.parametrize("text", ["", "x" * 2001])
def test_invalid_comment_text_is_rejected(other_auth_client, post, text):
    res = other_auth_client.post(comments_url(post.pk), {"text": text})

    assert res.status_code == 400
    assert "text" in res.data["error"]["fields"]


@pytest.mark.parametrize("method", ["get", "post"])
def test_comments_on_missing_post_return_404(auth_client, method):
    res = getattr(auth_client, method)(comments_url(999), {"text": "commenttext1"} if method == "post" else None)

    assert res.status_code == 404


def test_comments_are_newest_first_and_only_for_that_post(anon_client, post, user):
    other_post = Post.objects.create(author=user, title="Other", text="x")
    for text in ["commenttext1", "commenttext2", "commenttext3"]:
        Comment.objects.create(post=post, author=user, text=text)
    Comment.objects.create(post=other_post, author=user, text="commenttext4")

    res = anon_client.get(comments_url(post.pk))

    assert [c["text"] for c in res.data["results"]] == ["commenttext3", "commenttext2", "commenttext1"]


def test_cursor_pagination_returns_every_comment_once(anon_client, post, user):
    page_size = CommentPagination.page_size
    Comment.objects.bulk_create(Comment(post=post, author=user, text=f"commenttext{i}") for i in range(page_size * 2 + 1))

    pages, url = [], comments_url(post.pk)
    while url:  # follow `next` until the last page
        res = anon_client.get(url)
        pages.append(res.data["results"])
        url = res.data["next"]

    assert [len(p) for p in pages] == [page_size, page_size, 1]
    ids = [c["id"] for page in pages for c in page]
    assert sorted(ids) == sorted(Comment.objects.values_list("id", flat=True))


def test_comment_list_query_count_does_not_grow(anon_client, post, user, django_assert_num_queries):
    Comment.objects.bulk_create(Comment(post=post, author=user, text=f"commenttext{i}") for i in range(10))

    # one to check the post exists + one SELECT for comments joined with authors
    with django_assert_num_queries(2):
        anon_client.get(comments_url(post.pk))
