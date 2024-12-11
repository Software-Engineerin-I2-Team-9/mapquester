from django.contrib import admin
from .models import POI
from .models import PoiInteractions

# Register your models here.
admin.site.register(POI)
admin.site.register(PoiInteractions)
