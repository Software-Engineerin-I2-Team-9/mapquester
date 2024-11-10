import base64
import json
import boto3
import os
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework import status
from .models import POI
from users.models import User

# Initialize S3 client
# s3_client = boto3.client(
#     's3',
#     aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
#     aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
#     region_name=settings.AWS_S3_REGION_NAME
# )


@api_view(['POST'])
@parser_classes([MultiPartParser, JSONParser])  # Add MultiPartParser to handle files
def create_poi(request):
    data = request.data
    print("Data : ", data)

    # Step 1: Extract and validate data
    try:
        user = User.objects.get(id=data['userId'])
        latitude = data['latitude']
        longitude = data['longitude']
        is_public = data.get('isPublic', 1)
        is_deleted = data.get('isDeleted', 0)
        title = data['title']
        tag = data['tag']
        description = data['description']
        reactions = data.get('reactions', 0)
        content_files = data['content']
        print("Content: ", content_files)
    except KeyError as e:
        return Response({"error": f"Missing required field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

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
        content=[]  # This will be updated after uploading files
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

    return Response({"message": "POI created successfully", "poi_id": poi.id, "content_urls": local_urls},
                    status=status.HTTP_201_CREATED)


# API to update POI's isPublic and reactions
@api_view(['PATCH'])
def update_poi(request, poi_id):
    try:
        poi = POI.objects.get(id=poi_id)
        print("POI value : ", poi)
    except POI.DoesNotExist:
        return Response({"error": "POI not found"}, status=status.HTTP_404_NOT_FOUND)

    # Toggle isPublic if requested
    if 'isPublic' in request.data:
        poi.isPublic = request.data['isPublic']

    # Update reactions count if requested
    if 'reactions_change' in request.data:
        reactions_change = request.data['reactions_change']
        poi.reactions += reactions_change
        if poi.reactions < 0:
            poi.reactions = 0

    poi.save()
    return Response({"message": "POI updated successfully", "isPublic": poi.isPublic, "reactions": poi.reactions},
                    status=status.HTTP_200_OK)


# API to soft delete a POI
@api_view(['PATCH'])
def delete_poi(request, poi_id):
    try:
        poi = POI.objects.get(id=poi_id)
    except POI.DoesNotExist:
        return Response({"error": "POI not found"}, status=status.HTTP_404_NOT_FOUND)

    poi.isDeleted = 1
    poi.save()
    return Response({"message": "POI marked as deleted"}, status=status.HTTP_200_OK)