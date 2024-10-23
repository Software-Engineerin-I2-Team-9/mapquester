# Create your views here.
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from pois.models import POI

# Apply Filter View
@login_required
def apply_filter(request):
    # Initialize the queryset with all POIs
    pois = POI.objects.all()

    if request.method == 'POST':
        # Extract filter parameters from the POST request
        category = request.POST.get('category')
        name = request.POST.get('name')
        coordinates = request.POST.get('coordinates')
        keyword = request.POST.get('keyword')

        # Apply filters based on the provided parameters
        if category:
            pois = pois.filter(category=category)
        if name:
            pois = pois.filter(name__icontains=name)
        if coordinates:
            pois = pois.filter(coordinates=coordinates)
        if keyword:
            pois = pois.filter(description__icontains=keyword)

        # Return the filtered POIs to the template
        return render(request, 'filter_system/apply_filter.html', {'pois': pois})

    # Render an empty form when the user first opens the filter page
    return render(request, 'filter_system/apply_filter_form.html')
