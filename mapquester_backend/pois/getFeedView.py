from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import POI
from users.models import User
from django.http import JsonResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


# Get Feed (POIs by followed users)
def get_feed(request, user_id):
    if request.method == "GET":
        tags = request.GET.getlist("tags")
        view_type = request.GET.get("viewType")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse(
                {"error": f"User with ID {user_id} does not exist."}, status=404
            )

        # Fetch POIs created by followed users
        followed_users = user.following.values_list("following", flat=True)
        pois = POI.objects.filter(
            Q(userId__id__in=followed_users), isPublic=True
        ).order_by("-createdAt")

        if tags:
            pois = pois.filter(tag__in=tags)

        # Handling the list view with pagination
        if view_type == "list":
            # Pagination parameters
            try:
                page = int(request.GET.get("page", 1))
                page_size = int(request.GET.get("page_size", 10))
            except ValueError:
                return JsonResponse(
                    {"error": "Invalid pagination parameters"}, status=400
                )

            # Paginate the POIs
            paginator = Paginator(pois, page_size)
            try:
                pois_page = paginator.page(page)
            except PageNotAnInteger:
                pois_page = paginator.page(1)
            except EmptyPage:
                pois_page = paginator.page(paginator.num_pages)

            # Build paginated POI list
            poi_list = []
            for poi in pois_page.object_list:
                # Check if the POI has a valid userId and if it's not null
                poi_user = poi.userId.username if poi.userId else "Unknown User"

                poi_list.append(
                    {
                        "id": poi.id,
                        "user_id": poi.userId.id if poi.userId else None,
                        "user": poi_user,
                        "title": poi.title,
                        "description": poi.description,
                        "latitude": poi.latitude,
                        "longitude": poi.longitude,
                        "tag": poi.tag,
                        "created_at": poi.createdAt,
                        "updated_at": poi.updatedAt,
                        "content_urls": poi.content,
                    }
                )

            # Response with pagination metadata
            response_data = {
                "pois": poi_list,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_pages": paginator.num_pages,
                    "total_pois": paginator.count,
                },
            }

            return JsonResponse(response_data)

        # Handle map view with coordinate bounds
        elif view_type == "map":
            # Retrieve bounding box coordinates from request
            try:
                min_lat = float(request.GET.get("min_lat", -90))
                max_lat = float(request.GET.get("max_lat", 90))
                min_lon = float(request.GET.get("min_lon", -180))
                max_lon = float(request.GET.get("max_lon", 180))
                pois_query = pois.filter(
                    latitude__gte=min_lat,
                    latitude__lte=max_lat,
                    longitude__gte=min_lon,
                    longitude__lte=max_lon,
                )
            except (KeyError, ValueError):
                return JsonResponse(
                    {
                        "error": "Please provide valid min_lat, max_lat, min_lon, and max_lon values for map view"
                    },
                    status=400,
                )

            poi_list = []
            for poi in pois_query:
                poi_user = poi.userId.username if poi.userId else "Unknown User"

                poi_list.append(
                    {
                        "id": poi.id,
                        "user_id": poi.userId.id if poi.userId else None,
                        "user": poi_user,
                        "title": poi.title,
                        "description": poi.description,
                        "latitude": poi.latitude,
                        "longitude": poi.longitude,
                        "tag": poi.tag,
                        "created_at": poi.createdAt,
                        "updated_at": poi.updatedAt,
                        "content_urls": poi.content,
                    }
                )

            response_data = {"pois": poi_list}

            return JsonResponse(response_data)

    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)
