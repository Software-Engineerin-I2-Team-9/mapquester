from django.contrib import admin
from .models import POI

# Register POI model to make it accessible in the admin panel
admin.site.register(POI)