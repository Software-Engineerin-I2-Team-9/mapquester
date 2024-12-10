from django.urls import path

from . import views
from .followViews import follow_user, unfollow_user, get_followers, get_followings

urlpatterns = [
    # Define the paths for user-related functionalities
    path("signup/", views.signup, name="signup"),
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),
    path("edit-profile/", views.edit_profile, name="edit_profile"),
    path("delete-account/", views.delete_account, name="delete_account"),
    path("user/", views.get_user, name="get_user"),
    path("user/<str:username>/", views.get_user, name="get_user_detail"),
    path('follow/', follow_user, name='follow_user'),
    path('unfollow/', unfollow_user, name='unfollow_user'),
    path('<int:user_id>/followers/', get_followers, name='get_followers'),
    path('<int:user_id>/followings/', get_followings, name='get_followings')
]
