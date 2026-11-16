"""Every API error, from views or from DRF itself, has the same shape."""

import pytest
from django.urls import reverse

pytestmark = pytest.mark.django_db


def test_validation_error_shape(auth_client):
    res = auth_client.post(reverse("posts"), {"text": "no title"})

    assert res.status_code == 400
    assert res.data == {
        "error": {
            "message": "Title: This field is required.",
            "fields": {"title": ["This field is required."]},
        }
    }


def test_other_error_shape(anon_client):
    res = anon_client.get(reverse("post-detail", args=[999]))

    assert res.status_code == 404
    assert res.data == {"error": {"message": "No Post matches the given query."}}
