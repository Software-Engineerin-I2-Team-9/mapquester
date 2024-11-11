from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from .models import POI, PoiManager


# Create POI View
@login_required
def create_poi(request):
    if request.method == "POST":
        name = request.POST.get("name")
        description = request.POST.get("description")
        category = request.POST.get("category")
        coordinates = request.POST.get("coordinates")
        attachments = request.FILES.get("attachments")

        # Create POI instance
        poi = POI(
            name=name,
            description=description,
            category=category,
            coordinates=coordinates,
            attachments=attachments,
        )
        poi.save()

        messages.success(request, "POI created successfully!")
        return redirect("show_pois")  # Redirect to a view that lists POIs

    return render(request, "pois/create_poi.html")


# Edit POI View
@login_required
def edit_poi(request, poi_id):
    poi = get_object_or_404(POI, id=poi_id)

    if request.method == "POST":
        poi.name = request.POST.get("name")
        poi.description = request.POST.get("description")
        poi.category = request.POST.get("category")
        poi.coordinates = request.POST.get("coordinates")
        if "attachments" in request.FILES:
            poi.attachments = request.FILES.get("attachments")

        poi.save()

        messages.success(request, "POI updated successfully!")
        return redirect("show_pois")

    return render(request, "pois/edit_poi.html", {"poi": poi})


# Delete POI View
@login_required
def delete_poi(request, poi_id):
    poi = get_object_or_404(POI, id=poi_id)

    if request.method == "POST":
        poi.delete()
        messages.success(request, "POI deleted successfully!")
        return redirect("show_pois")

    return render(request, "pois/delete_poi.html", {"poi": poi})


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
        return redirect("show_pois")

    messages.error(request, "POI cannot be recovered.")
    return redirect("show_pois")
