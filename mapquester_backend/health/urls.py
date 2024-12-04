from django.urls import path

from . import views

urlpatterns = [
    # Define the paths for map view functionalities
    path("root_view/", views.root_view, name="root_view"),
]
