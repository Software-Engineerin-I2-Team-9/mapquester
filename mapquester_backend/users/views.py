from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .forms import UserRegisterForm, UserLoginForm

User = get_user_model()


@api_view(["POST"])
def signup(request):
    form = UserRegisterForm(request.data)
    if form.is_valid():
        user = form.save()
        return Response(
            {
                "message": f"Account created successfully for {user.username}!",
                "details": "Please log in to access your account.",
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(
        {"error": "Registration failed", "form_errors": form.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["POST"])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": f"Welcome back, {user.username}!",
                "id": str(user.id),
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_200_OK,
        )
    return Response(
        {"error": "Authentication failed", "detail": "Invalid username or password"},
        status=status.HTTP_401_UNAUTHORIZED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data["refresh_token"]
        print(refresh_token)
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(
            {"message": "You have been successfully logged out."},
            status=status.HTTP_205_RESET_CONTENT,
        )
    except Exception as e:
        print(f"Error during logout: {str(e)}")
        return Response(
            {"error": "Invalid token or token not provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    user.delete()
    return Response(
        {"message": "Your account has been deleted successfully."},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user(request, username=None):
    if username:
        users = User.objects.filter(username__icontains=username).values(
            "id", "username", "email", "profile_info"
        )
        if users.exists():
            return Response(
                {"users": list(users), "count": users.count()},
                status=status.HTTP_200_OK,
            )
        return Response(
            {"error": "No users found matching the criteria"},
            status=status.HTTP_404_NOT_FOUND,
        )
    else:
        users = User.objects.all().values("id", "username")
        return Response(
            {"users": list(users), "count": users.count()}, status=status.HTTP_200_OK
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_exact_user(request, id):
    try:
        user = User.objects.get(id=id)
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_info": getattr(user, "profile_info", None)
        }
        return Response(user_data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found with the provided ID"},
            status=status.HTTP_404_NOT_FOUND,
        )
