from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .auth_system import AuthSystem
from .forms import UserLoginForm, UserRegisterForm
from .models import User


# Register View
@api_view(["POST"])
def signup(request):
    form = UserRegisterForm(request.data)
    if form.is_valid():
        user = form.save()
        return Response(
            {"message": f"Account created for {user.username}!"},
            status=status.HTTP_201_CREATED,
        )
    print(form.errors)
    return Response(
        {"error": "Registration failed", "form_errors": form.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


# Login View
@api_view(["POST"])
def login(request):
    form = UserLoginForm(data=request.data)
    if form.is_valid():
        user = form.get_user()
        auth_login(request, user)
        return Response(
            {"message": f"Welcome back, {user.username}!"}, status=status.HTTP_200_OK
        )
    else:
        return Response(
            {"error": "Authentication failed", "form_errors": form.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


# Edit Profile View
@login_required
@api_view(["POST"])
def edit_profile(request):
    user = request.user
    user.username = request.data.get("username", user.username)
    user.email = request.data.get("email", user.email)
    user.profile_info = request.data.get("profile_info", user.profile_info)

    user.save()
    return Response(
        {"message": "Your profile has been updated successfully."},
        status=status.HTTP_200_OK,
    )


# Delete Account View
@login_required
@api_view(["POST"])
def delete_account(request):
    user = request.user
    user.delete()
    return Response(
        {"message": "Your account has been deleted successfully."},
        status=status.HTTP_200_OK,
    )
