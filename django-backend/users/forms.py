from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import User

# User Registration Form
class UserRegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

# User Login Form
class UserLoginForm(AuthenticationForm):
    class Meta:
        model = User
        fields = ['username', 'password']
