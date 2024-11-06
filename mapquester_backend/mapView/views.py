# from django.shortcuts import render
# from .models import MapView
# from filters.filter_system import FilterSystem

# class MapViewController:
#     def display_map(self, request):
#         # Controller logic for showing map
#         pass

#     def apply_filter(self, filter_criteria):
#         filter_system = FilterSystem()
#         return filter_system.apply_filter(filter_criteria)


from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from pois.models import POI


# Show POIs on Map View
@login_required
def show_map(request):
    # Fetch all POIs to display on the map
    pois = POI.objects.all()
    return render(request, "map_view/show_map.html", {"pois": pois})


# Toggle Layers View
@login_required
def toggle_layers(request):
    if request.method == "POST":
        # Logic to handle layer toggling based on user input
        layer = request.POST.get("layer")  # Example: retrieving a layer identifier
        action = request.POST.get("action")  # 'enable' or 'disable'

        # Implement your logic for toggling layers here
        if action == "enable":
            # Enable the layer
            pass
        elif action == "disable":
            # Disable the layer
            pass

        # Provide feedback to the user (can be used with JavaScript on the frontend)
        return render(request, "map_view/toggle_layers.html", {"status": "Layer toggled successfully."})

    # Render the template with available layers for toggling
    return render(request, "map_view/toggle_layers.html")


# Filter POIs View
@login_required
def filter_pois(request):
    # Initialize a query set for POIs
    pois = POI.objects.all()

    if request.method == "POST":
        category = request.POST.get("category")
        keyword = request.POST.get("keyword")

        # Apply filters based on user input
        if category:
            pois = pois.filter(category=category)
        if keyword:
            pois = pois.filter(name__icontains=keyword)

        # Provide filtered POIs to the template
        return render(request, "map_view/show_map.html", {"pois": pois})

    # Render the initial filter template with no filters applied
    return render(request, "map_view/filter_pois.html")
