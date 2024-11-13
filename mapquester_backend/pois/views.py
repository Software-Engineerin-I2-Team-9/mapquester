import base64
import json

# FIXME: need to add to requirements
# import boto3
import os
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework import status
from .models import POI
from users.models import User
from django.http import JsonResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

# Initialize S3 client
# s3_client = boto3.client(
#     's3',
#     aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
#     aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
#     region_name=settings.AWS_S3_REGION_NAME
# )


@api_view(["POST"])
@parser_classes([MultiPartParser, JSONParser])  # Add MultiPartParser to handle files
def create_poi(request):
    data = request.data
    print("Data : ", data)

    # Step 1: Extract and validate data
    try:
        user = User.objects.get(id=data["userId"])
        latitude = data["latitude"]
        longitude = data["longitude"]
        is_public = data.get("isPublic", 1)
        is_deleted = data.get("isDeleted", 0)
        title = data["title"]
        tag = data["tag"]
        description = data["description"]
        reactions = data.get("reactions", 0)
        content_files = data["content"]
        print("Content: ", content_files)
    except KeyError as e:
        return Response(
            {"error": f"Missing required field: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Step 2: Create POI entry in the database (initially with empty content field)
    poi = POI.objects.create(
        userId=user,
        latitude=latitude,
        longitude=longitude,
        isPublic=is_public,
        isDeleted=is_deleted,
        title=title,
        tag=tag,
        description=description,
        reactions=reactions,
        content=[],  # This will be updated after uploading files
    )

    # Step 3: Upload files to S3 and collect URLs
    local_urls = []
    # for content_file in content_files:
    #     try:
    #         file_name = content_file['filename']
    #         file_path = f"poi_attachments/{poi.id}/{file_name}"
    #
    #         # Ensure the directory exists
    #         os.makedirs(os.path.dirname(os.path.join(settings.MEDIA_ROOT, file_path)), exist_ok=True)
    #
    #         # Save file using Django's storage system
    #         image_data = base64.b64decode(content_file['data'])
    #         file_path = default_storage.save(file_path, image_data)
    #
    #         # Get file URL and add to list
    #         file_url = settings.MEDIA_URL + file_path
    #         local_urls.append(file_url)
    #
    #     except Exception as e:
    #         return Response({"error": f"Failed to save {file_name}: {str(e)}"},
    #                         status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # s3_urls = []
    # for content_file in content_files:
    #     try:
    #         file_name = content_file.name
    #         s3_key = f"poi_attachments/{poi.id}/{file_name}"
    #
    #         # Upload file to S3
    #         s3_client.upload_fileobj(
    #             content_file,
    #             settings.AWS_STORAGE_BUCKET_NAME,
    #             s3_key,
    #             ExtraArgs={'ACL': 'public-read'}
    #         )
    #
    #         # Get file URL and add to list
    #         file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
    #         s3_urls.append(file_url)
    #
    #     except Exception as e:
    #         return Response({"error": f"Failed to upload {file_name}: {str(e)}"},
    #                         status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Step 4: Update the POI entry with S3 URLs
    poi.content = local_urls
    poi.save()

    return Response(
        {
            "message": "POI created successfully",
            "poi_id": poi.id,
            "content_urls": local_urls,
        },
        status=status.HTTP_201_CREATED,
    )


# API to return a filtered list of POIS
@api_view(["GET"])
def get_pois(request, user_id):
    # Get view type and filter list from the request
    view_type = request.GET.get("view", "list")
    tags = request.GET.getlist("tags")

    # Initialize query for the user's POIs, excluding deleted POIs
    pois_query = POI.objects.filter(userId=user_id, isDeleted=False)

    # Apply tag filtering if tags are provided
    if tags:
        pois_query = pois_query.filter(tag__in=tags)

    # Handle list view with pagination
    if view_type == "list":
        # Pagination parameters
        try:
            page = int(request.GET.get("page", 1))
            page_size = int(request.GET.get("page_size", 10))
        except ValueError:
            return Response({"error": "Invalid pagination parameters"}, status=400)

        # Paginate the POIs
        paginator = Paginator(pois_query, page_size)
        try:
            pois_page = paginator.page(page)
        except PageNotAnInteger:
            pois_page = paginator.page(1)
        except EmptyPage:
            pois_page = paginator.page(paginator.num_pages)

        # Convert paginated data to list of dictionaries
        pois = list(pois_page.object_list.values())

        # Include pagination metadata in response
        response_data = {
            "pois": pois,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_pages": paginator.num_pages,
                "total_pois": paginator.count,
            },
        }

    # Handle map view with coordinate bounds
    elif view_type == "map":
        # Retrieve bounding box coordinates from request
        try:
            min_lat = float(request.GET["min_lat"])
            max_lat = float(request.GET["max_lat"])
            min_lon = float(request.GET["min_lon"])
            max_lon = float(request.GET["max_lon"])
            pois_query = pois_query.filter(
                latitude__gte=min_lat,
                latitude__lte=max_lat,
                longitude__gte=min_lon,
                longitude__lte=max_lon,
            )
        except (KeyError, ValueError):
            return Response(
                {
                    "error": "Please provide valid min_lat, max_lat, min_lon, and max_lon values for map view"
                },
                status=400,
            )

        # Convert the filtered data to a list of dictionaries
        pois = list(pois_query.values())
        response_data = {"pois": pois}

    else:
        return Response(
            {"error": "Invalid view type. Use 'list' or 'map'."}, status=400
        )

    # Return the response data as JSON
    return JsonResponse(response_data, safe=False)


# API to update POI's isPublic and reactions
@api_view(["PATCH"])
def update_poi(request, poi_id):
    try:
        poi = POI.objects.get(id=poi_id)
        print("POI value : ", poi)
    except POI.DoesNotExist:
        return Response({"error": "POI not found"}, status=status.HTTP_404_NOT_FOUND)

    # Toggle isPublic if requested
    if "isPublic" in request.data:
        poi.isPublic = request.data["isPublic"]

    # Update reactions count if requested
    if "reactions_change" in request.data:
        reactions_change = request.data["reactions_change"]
        poi.reactions += reactions_change
        if poi.reactions < 0:
            poi.reactions = 0

    poi.save()
    return Response(
        {
            "message": "POI updated successfully",
            "isPublic": poi.isPublic,
            "reactions": poi.reactions,
        },
        status=status.HTTP_200_OK,
    )


# API to soft delete a POI
@api_view(["PATCH"])
def delete_poi(request, poi_id):
    try:
        poi = POI.objects.get(id=poi_id)
    except POI.DoesNotExist:
        return Response({"error": "POI not found"}, status=status.HTTP_404_NOT_FOUND)

    poi.isDeleted = 1
    poi.save()
    return Response({"message": "POI marked as deleted"}, status=status.HTTP_200_OK)
