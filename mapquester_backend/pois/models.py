from django.db import models
from users.models import User

class POI(models.Model):
    id = models.AutoField(primary_key=True)
    userId = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    coordinates = models.CharField(max_length=500)
    attachments = models.FileField(upload_to='attachments/', blank=True, null=True)

    def create_poi(self):
        # Logic to create POI
        pass

    def edit_poi(self):
        # Logic to edit POI
        pass

    def delete_poi(self):
        # Logic to delete POI
        pass

class PoiManager(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def create_poi(self, data):
        # Logic to create POI
        pass

    def edit_poi(self, poi_id, data):
        # Logic to edit POI
        pass

    def delete_poi(self, poi_id):
        # Logic to delete POI
        pass

    def recover_poi(self, poi_id):
        # Logic to recover POI
        pass
