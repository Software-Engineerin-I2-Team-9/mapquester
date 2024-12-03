from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from pois.models import POI
import base64
import json

User = get_user_model()


class POITests(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        # Create test POI data
        self.test_poi_data = {
            "userId": self.user.id,
            "title": "Test Location",
            "description": "Test Description",
            "tag": "restaurant",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "isPublic": True,
            "content": [],
        }

        # Create a test POI
        self.poi = POI.objects.create(
            userId=self.user,
            title="Test Location",
            description="Test Description",
            tag="restaurant",
            latitude=40.7128,
            longitude=-74.0060,
            isPublic=True,
            content=[],
            reactions=0,
        )

    def test_create_poi(self):
        """Test POI creation"""
        response = self.client.post(
            reverse("create_poi"), data=self.test_poi_data, format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(POI.objects.filter(title="Test Location").exists())
        self.assertIn("poi_id", response.json())
        self.assertIn("content_urls", response.json())

    def test_get_pois_list(self):
        """Test POI list retrieval"""
        response = self.client.get(
            reverse("get_pois", args=[self.user.id]),
            {"view": "list", "page": 1, "page_size": 10},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("pois", response.json())
        self.assertIn("pagination", response.json())

    def test_get_pois_map(self):
        """Test POI map view retrieval"""
        response = self.client.get(
            reverse("get_pois", args=[self.user.id]),
            {
                "view": "map",
                "min_lat": 40.0,
                "max_lat": 41.0,
                "min_lon": -75.0,
                "max_lon": -73.0,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("pois", response.json())

    def test_update_poi(self):
        """Test POI update"""
        update_data = {"isPublic": False, "reactions_change": 1}
        response = self.client.patch(
            reverse("update_poi", args=[self.poi.id]),
            data=json.dumps(update_data),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        updated_poi = POI.objects.get(id=self.poi.id)
        self.assertFalse(updated_poi.isPublic)
        self.assertEqual(updated_poi.reactions, 1)

    def test_delete_poi(self):
        """Test POI soft deletion"""
        response = self.client.patch(reverse("delete_poi", args=[self.poi.id]))
        self.assertEqual(response.status_code, 200)
        deleted_poi = POI.objects.get(id=self.poi.id)
        self.assertEqual(deleted_poi.isDeleted, 1)

    def test_invalid_poi_update(self):
        """Test updating non-existent POI"""
        response = self.client.patch(
            reverse("update_poi", args=[99999]),
            data=json.dumps({"isPublic": False}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)

    def test_get_pois_invalid_view(self):
        """Test POI retrieval with invalid view type"""
        response = self.client.get(
            reverse("get_pois", args=[self.user.id]), {"view": "invalid"}
        )
        self.assertEqual(response.status_code, 400)

    def test_get_pois_invalid_map_params(self):
        """Test map view with missing coordinates"""
        response = self.client.get(
            reverse("get_pois", args=[self.user.id]), {"view": "map"}
        )
        self.assertEqual(response.status_code, 400)

    def test_create_poi_missing_fields(self):
        """Test POI creation with missing required fields"""
        invalid_data = {"userId": self.user.id, "title": "Test Location"}
        response = self.client.post(
            reverse("create_poi"),
            data=json.dumps(invalid_data),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_update_poi_negative_reactions(self):
        """Test POI update with negative reactions"""
        update_data = {"reactions_change": -5}
        response = self.client.patch(
            reverse("update_poi", args=[self.poi.id]),
            data=json.dumps(update_data),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        updated_poi = POI.objects.get(id=self.poi.id)
        self.assertEqual(updated_poi.reactions, 0)
