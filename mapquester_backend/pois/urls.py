from django.urls import path

from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Define the paths for POI management
    path("create/", views.create_poi, name="create_poi"),
    path("update/<int:poi_id>/", views.update_poi, name="update_poi"),
    path("get/<int:user_id>/", views.get_pois, name="get_pois"),
    path("delete/<int:poi_id>/", views.delete_poi, name="delete_poi"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
