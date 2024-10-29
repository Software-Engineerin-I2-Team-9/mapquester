from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import POI, PoiManager
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
# import base64
# import json

# Create POI View

User = get_user_model()


#@login_required
@api_view(['POST'])
def create_poi(request):
    # Extract and validate JSON payload
    data = request.data
    user_id = data.get("userId")
    name = data.get("name")
    description = data.get("description")
    category = data.get("category")
    coordinates = data.get("coordinates")
    attachments = data.get("attachments")

    # Validate required fields
    if not (user_id and name and description and category and coordinates):
        return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

    # Check if the user exists
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # Format coordinates
    coordinates_str = f"{coordinates['latitude']},{coordinates['longitude']}"

    # Create POI instance without saving to handle files separately
    poi = POI(
        userId=user,
        name=name,
        description=description,
        category=category,
        coordinates=coordinates_str
    )

    # Save attachments (for simplicity, handling as one file)
    if attachments:
        # This part assumes attachments are base64-encoded file data
        for attachment in attachments:
            # Process each file (if attachments are in base64)
            format, file_str = attachment.split(';base64,')
            ext = format.split('/')[-1]  # get file extension
            #poi.attachments.save(f"attachment.{ext}", ContentFile(base64.b64decode(file_str)))
            break  # Save only the first file for now

    # Save POI instance
    poi.save()

    # Response with created POI details
    return Response(
        {
            "id": poi.id,
            "userId": poi.userId.id,
            "name": poi.name,
            "description": poi.description,
            "category": poi.category,
            "coordinates": coordinates_str,
            "attachments": poi.attachments.url if poi.attachments else None
        },
        status=status.HTTP_201_CREATED
    )


# @login_required
# def create_poi(request):
#     if request.method == 'POST':
#         name = request.POST.get('name')
#         description = request.POST.get('description')
#         category = request.POST.get('category')
#         coordinates = request.POST.get('coordinates')
#         isActive = request.POST.get('')
#         attachments = request.FILES.get('attachments')
#
#         # Create POI instance
#         poi = POI(
#             name=name,
#             description=description,
#             category=category,
#             coordinates=coordinates,
#             attachments=attachments
#         )
#         poi.save()
#
#         messages.success(request, "POI created successfully!")
#         return redirect('show_pois')  # Redirect to a view that lists POIs
#
#     return render(request, 'pois/create_poi.html')

# Edit POI View
@login_required
def edit_poi(request, poi_id):
    poi = get_object_or_404(POI, id=poi_id)

    if request.method == 'POST':
        poi.name = request.POST.get('name')
        poi.description = request.POST.get('description')
        poi.category = request.POST.get('category')
        poi.coordinates = request.POST.get('coordinates')
        if 'attachments' in request.FILES:
            poi.attachments = request.FILES.get('attachments')

        poi.save()

        messages.success(request, "POI updated successfully!")
        return redirect('show_pois')

    return render(request, 'pois/edit_poi.html', {'poi': poi})

# Delete POI View
@login_required
def delete_poi(request, poi_id):
    poi = get_object_or_404(POI, id=poi_id)

    if request.method == 'POST':
        poi.delete()
        messages.success(request, "POI deleted successfully!")
        return redirect('show_pois')

    return render(request, 'pois/delete_poi.html', {'poi': poi})

# Recover POI View
@login_required
def recover_poi(request, poi_id):
    # This assumes you have a way to mark POIs as "deleted" without actually deleting them.
    # Example: A boolean field `is_deleted` on the POI model.
    poi = get_object_or_404(POI, id=poi_id)

    if poi.is_deleted:
        poi.is_deleted = False
        poi.save()
        messages.success(request, "POI recovered successfully!")
        return redirect('show_pois')

    messages.error(request, "POI cannot be recovered.")
    return redirect('show_pois')
