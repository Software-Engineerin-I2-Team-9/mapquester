from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib import messages
from .models import User
from .auth_system import AuthSystem
from .forms import UserRegisterForm, UserLoginForm
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError


# Register View
@api_view(['POST']) 
def signup(request):
    form = UserRegisterForm(request.data)
    if form.is_valid():
        form.save()
        username = form.cleaned_data.get('username')
        return Response({'message': f'Account created for {username}!'}, status=status.HTTP_201_CREATED)
    return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

# Login View
@api_view(['POST'])
def login(request):
    form = UserLoginForm(request, data=request.data)
    print(request.data)
    if form.is_valid():
        username = form.cleaned_data.get('username')
        password = form.cleaned_data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            auth_login(request, user)
            return Response({'message': f'Welcome back, {username}!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials. Please check your username and password.'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        # Add more detailed error handling
        errors = {}
        for field, error_list in form.errors.items():
            errors[field] = error_list[0]  # Get the first error message for each field
        
        return Response({
            'error': 'Login failed.',
            'details': errors
        }, status=status.HTTP_400_BAD_REQUEST)

# Edit Profile View
@login_required
@api_view(['POST'])
def edit_profile(request):
    user = request.user
    user.username = request.data.get('username', user.username)
    user.email = request.data.get('email', user.email)
    user.profile_info = request.data.get('profile_info', user.profile_info)
    
    user.save()
    return Response({'message': 'Your profile has been updated successfully.'}, status=status.HTTP_200_OK)

# Delete Account View
@login_required
@api_view(['POST'])
def delete_account(request):
    user = request.user
    user.delete()
    return Response({'message': 'Your account has been deleted successfully.'}, status=status.HTTP_200_OK)
