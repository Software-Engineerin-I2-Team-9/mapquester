from django.db import models

from users.models import User
from django.utils.timezone import now


class POI(models.Model):
    id = models.AutoField(primary_key=True)
    userId = models.ForeignKey(
        User, on_delete=models.CASCADE, db_column="userId"
    )  # db_column is set explicitly, if not Django will append _id to the name, which will become userId_id
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6
    )  # Decimal for more precision in coordinates
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    isPublic = models.BooleanField(default=True)  # Representing public/private status
    isDeleted = models.BooleanField(default=False)  # Representing soft deletion status
    title = models.CharField(max_length=255)  # Title for the POI
    tag = models.CharField(max_length=100)  # A tag/category for the POI
    description = models.TextField()  # Detailed description
    reactions = models.IntegerField(default=0)  # Count of reactions
    createdAt = models.DateTimeField(default=now, editable=False)
    updatedAt = models.DateTimeField(default=now, editable=False)
    content = models.JSONField(
        blank=True, null=True
    )  # Storing S3 URLs as a list of strings

    def __str__(self):
        return self.title


class PoiInteractions(models.Model):
    INTERACTION_TYPES = [
        ('reaction', 'Reaction'),
        ('comment', 'Comment'),
    ]

    id = models.AutoField(primary_key=True)
    userId = models.ForeignKey(User, on_delete=models.CASCADE, related_name="poi_interactions")
    poiId = models.ForeignKey(POI, on_delete=models.CASCADE, related_name="interactions")
    interactionType = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    content = models.TextField(blank=True, null=True)  # Only required for comments
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.userId} {self.interactionType} on POI {self.poiId}"