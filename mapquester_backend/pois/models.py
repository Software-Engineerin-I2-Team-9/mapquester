from django.db import models

from users.models import User


class POI(models.Model):
    id = models.AutoField(primary_key=True)
    userId = models.ForeignKey(User, on_delete=models.CASCADE)  # Linking to User model
    latitude = models.DecimalField( max_digits=9, decimal_places=6)  # Decimal for more precision in coordinates
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    isPublic = models.BooleanField(default=True)  # Representing public/private status
    isDeleted = models.BooleanField(default=False)  # Representing soft deletion status
    title = models.CharField(max_length=255)  # Title for the POI
    tag = models.CharField(max_length=100)  # A tag/category for the POI
    description = models.TextField()  # Detailed description
    reactions = models.IntegerField(default=0)  # Count of reactions
    content = models.JSONField(
        blank=True, null=True
    )  # Storing S3 URLs as a list of strings

    def __str__(self):
        return self.title
