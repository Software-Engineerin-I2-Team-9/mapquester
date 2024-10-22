from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib import messages
from .models import User
from .auth_system import AuthSystem
from .forms import UserRegisterForm, UserLoginForm
from django.contrib.auth.decorators import login_required


# Register View
def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}!')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'users/register.html', {'form': form})

# Login View
def login(request):
    if request.method == 'POST':
        form = UserLoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Welcome back, {username}!')
                return redirect('home')  # Redirect to the home page or dashboard
            else:
                messages.error(request, 'Invalid username or password.')
        else:
            messages.error(request, 'Invalid username or password.')
    
    form = UserLoginForm()
    return render(request, 'users/login.html', {'form': form})

# Edit Profile View
@login_required
def edit_profile(request):
    if request.method == 'POST':
        user = request.user
        user.username = request.POST.get('username', user.username)
        user.email = request.POST.get('email', user.email)
        user.profile_info = request.POST.get('profile_info', user.profile_info)
        
        user.save()
        messages.success(request, 'Your profile has been updated successfully.')
        return redirect('edit_profile')
    
    return render(request, 'users/edit_profile.html')

# Delete Account View
@login_required
def delete_account(request):
    if request.method == 'POST':
        user = request.user
        user.delete()
        messages.success(request, 'Your account has been deleted successfully.')
        return redirect('register')
    
    return render(request, 'users/delete_account.html')
