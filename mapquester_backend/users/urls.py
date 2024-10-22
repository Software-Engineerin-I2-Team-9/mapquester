from django.urls import path
from . import views

urlpatterns = [
    # Define the paths for user-related functionalities
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('edit-profile/', views.edit_profile, name='edit_profile'),
    path('delete-account/', views.delete_account, name='delete_account'),
]