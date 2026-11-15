import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    """Anonymous client."""
    return APIClient()


@pytest.fixture
def user(db):
    return get_user_model().objects.create_user(username="user1", password="S3cure-pass!")


@pytest.fixture
def other_user(db):
    return get_user_model().objects.create_user(username="user2", password="S3cure-pass!")


@pytest.fixture
def auth_client(user):
    """Client logged in as `user`."""
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def other_auth_client(other_user):
    """Client logged in as `other_user`."""
    client = APIClient()
    client.force_authenticate(user=other_user)
    return client
