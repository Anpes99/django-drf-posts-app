from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Custom user model. Add extra profile fields here."""

    def __str__(self):
        return self.username
