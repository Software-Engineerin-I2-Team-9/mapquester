from django.urls import path

from . import views

urlpatterns = [
    # Define the paths for map view functionalities
    path("", views.health_check, name="health_check"),
]
