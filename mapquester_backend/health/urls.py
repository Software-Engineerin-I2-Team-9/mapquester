from django.urls import path

from . import views

urlpatterns = [
    # Define the paths for map view functionalities
    path("show/", views.show_map, name="show_map"),
    path("toggle-layers/", views.toggle_layers, name="toggle_layers"),
    path("filter/", views.filter_pois, name="filter_pois"),
]
