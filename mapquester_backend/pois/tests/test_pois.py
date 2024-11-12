# mapquester_backend/pois/tests/test_pois.py
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from ..models import POI

User = get_user_model()


class POITests(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        # Create test POI data
        self.test_poi_data = {
            "name": "Test Location",
            "description": "Test Description",
            "category": "restaurant",
            "coordinates": "40.7128,-74.0060",
        }

        # Create a test POI
        self.poi = POI.objects.create(userId=self.user, **self.test_poi_data)

    def test_create_poi(self):
        """Test POI creation"""
        self.client.login(username="testuser", password="testpass123")
        response = self.client.post(reverse("create_poi"), self.test_poi_data)
        self.assertEqual(response.status_code, 302)  # Check redirect after creation
        self.assertTrue(POI.objects.filter(name="Test Location").exists())

    def test_edit_poi(self):
        """Test POI editing"""
        self.client.login(username="testuser", password="testpass123")
        edit_data = self.test_poi_data.copy()
        edit_data["name"] = "Updated Location"
        response = self.client.post(reverse("edit_poi", args=[self.poi.id]), edit_data)
        self.assertEqual(response.status_code, 302)  # Check redirect after edit
        updated_poi = POI.objects.get(id=self.poi.id)
        self.assertEqual(updated_poi.name, "Updated Location")

    def test_delete_poi(self):
        """Test POI deletion"""
        self.client.login(username="testuser", password="testpass123")
        response = self.client.post(reverse("delete_poi", args=[self.poi.id]))
        self.assertEqual(response.status_code, 302)  # Check redirect after deletion
        self.assertFalse(POI.objects.filter(id=self.poi.id).exists())
