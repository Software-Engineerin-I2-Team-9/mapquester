from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import POI
from users.models import User
from django.http import JsonResponse


# Get Feed (POIs by followed users)
def get_feed(request, user_id):
    if request.method == "GET":
        user = get_object_or_404(User, id=user_id)

        # Fetch POIs created by followed users
        followed_users = user.following.values_list("following", flat=True)
        pois = POI.objects.filter(
            Q(userId__id__in=followed_users), isPublic=True
        ).order_by("-createdAt")

        poi_list = []
        for poi in pois:
            # Check if the POI has a valid userId and if it's not null
            poi_user = poi.userId.username if poi.userId else "Unknown User"

            poi_list.append(
                {
                    "id": poi.id,
                    "title": poi.title,
                    "description": poi.description,
                    "latitude": poi.latitude,
                    "longitude": poi.longitude,
                    "user": poi_user,  # Use the checked userId.username or default value
                    "created_at": poi.createdAt,
                    "updated_at": poi.updatedAt,
                }
            )

        return JsonResponse({"feed": poi_list})
