from django.urls import path

from . import views

urlpatterns = [
    # Define the paths for filtering functionality
    path("apply/", views.apply_filter, name="apply_filter"),
]
