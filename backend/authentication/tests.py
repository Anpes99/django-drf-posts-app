import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

pytestmark = pytest.mark.django_db

User = get_user_model()

PASSWORD = "S3cure-pass!"  # matches the `user` fixture in conftest.py


# --- signup ---


def test_signup_creates_user_and_logs_in(anon_client):
    res = anon_client.post(reverse("signup"), {"username": "newuser", "password": PASSWORD})

    assert res.status_code == 201
    user = User.objects.get(username="newuser")
    assert user.check_password(PASSWORD)
    assert user.password != PASSWORD  # stored hashed, not in plain text

    # the session cookie from signup authenticates later requests
    me = anon_client.get(reverse("me"))
    assert me.status_code == 200
    assert me.data["username"] == "newuser"


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"username": "newuser"},
        {"password": PASSWORD},
        {"username": "", "password": PASSWORD},
    ],
)
def test_signup_requires_username_and_password(anon_client, payload):
    res = anon_client.post(reverse("signup"), payload)

    assert res.status_code == 400
    assert "fields" in res.data["error"]
    assert User.objects.count() == 0


@pytest.mark.parametrize("weak_password", ["short1", "password123", "12345678901"])
def test_signup_rejects_weak_password(anon_client, weak_password):
    res = anon_client.post(reverse("signup"), {"username": "newuser", "password": weak_password})

    assert res.status_code == 400
    assert "password" in res.data["error"]["fields"]
    assert not User.objects.filter(username="newuser").exists()


def test_signup_rejects_duplicate_username(anon_client, user):
    res = anon_client.post(reverse("signup"), {"username": user.username, "password": PASSWORD})

    assert res.status_code == 400
    assert User.objects.filter(username=user.username).count() == 1


# --- login ---


def test_login_with_valid_credentials_starts_session(anon_client, user):
    res = anon_client.post(reverse("login"), {"username": user.username, "password": PASSWORD})

    assert res.status_code == 200
    assert "sessionid" in res.cookies

    me = anon_client.get(reverse("me"))
    assert me.status_code == 200
    assert me.data == {"id": user.id, "username": user.username}


@pytest.mark.parametrize(
    "username, password",
    [
        ("user1", "wrong-password"),
        ("no-such-user", PASSWORD),
    ],
)
def test_login_with_invalid_credentials_fails(anon_client, user, username, password):
    res = anon_client.post(reverse("login"), {"username": username, "password": password})

    assert res.status_code == 401
    # the same message either way, so the API doesn't reveal which usernames exist
    assert res.data == {"error": {"message": "Invalid credentials"}}
    assert anon_client.get(reverse("me")).status_code == 403


@pytest.mark.parametrize(
    "payload",
    [
        {"username": "user1"},
        {"password": PASSWORD},
        {},
    ],
)
def test_login_requires_username_and_password(anon_client, user, payload):
    res = anon_client.post(reverse("login"), payload)

    assert res.status_code == 400


def test_inactive_user_cannot_log_in(anon_client, user):
    user.is_active = False
    user.save()

    res = anon_client.post(reverse("login"), {"username": user.username, "password": PASSWORD})

    assert res.status_code == 401


# --- logout ---


def test_logout_ends_session(anon_client, user):
    anon_client.post(reverse("login"), {"username": user.username, "password": PASSWORD})
    assert anon_client.get(reverse("me")).status_code == 200

    res = anon_client.post(reverse("logout"))

    assert res.status_code == 200
    assert anon_client.get(reverse("me")).status_code == 403


def test_logout_when_not_logged_in_is_harmless(anon_client):
    res = anon_client.post(reverse("logout"))

    assert res.status_code == 200


# --- me ---


def test_me_requires_authentication(anon_client):
    res = anon_client.get(reverse("me"))

    assert res.status_code == 403


def test_me_returns_only_public_fields(auth_client, user):
    res = auth_client.get(reverse("me"))

    assert res.status_code == 200
    assert res.data == {"id": user.id, "username": user.username}


@pytest.mark.parametrize("url_name", ["signup", "login", "logout"])
def test_auth_endpoints_reject_get(anon_client, url_name):
    res = anon_client.get(reverse(url_name))

    assert res.status_code == 405
