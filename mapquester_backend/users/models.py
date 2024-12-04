from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # Add any custom fields here
    profile_info = models.TextField(blank=True)

    def __str__(self):
        return self.username

    # Override groups and user_permissions to avoid conflicts
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_groups",
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )

    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_permissions",
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

    # username = models.CharField(max_length=100, unique=True)
    # email = models.EmailField(unique=True)
    # password = models.CharField(max_length=100)
    # profile_info = models.TextField(null=True, blank=True)

    def register(self):
        # Logic for registering a user
        pass

    def login(self):
        # Logic for user login
        pass

    def edit_profile(self):
        # Logic for editing user profile
        pass

    def delete_account(self):
        # Logic for deleting user account
        pass
