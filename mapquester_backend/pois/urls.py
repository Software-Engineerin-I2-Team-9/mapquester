from django.urls import path

from . import views

urlpatterns = [
    # Define the paths for POI management
    path("create/", views.create_poi, name="create_poi"),
    path("edit/<int:id>/", views.edit_poi, name="edit_poi"),
    path("delete/<int:id>/", views.delete_poi, name="delete_poi"),
    path("recover/<int:id>/", views.recover_poi, name="recover_poi"),
]
