from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.db.models import Q
from .models import Follow

# from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
import json

User = get_user_model()


@csrf_exempt
def follow_user(request):
    """
    API to follow a user
    """
    if request.method == "POST":
        data = json.loads(request.body)
        follower_id = data.get("followerId")
        following_id = data.get("followingId")

        if follower_id == following_id:
            return JsonResponse(
                {"error": "Users cannot follow themselves."}, status=400
            )

        # Check if follower and following users exist
        try:
            follower = User.objects.get(id=follower_id)
        except User.DoesNotExist:
            return JsonResponse(
                {"error": f"User with ID {follower_id} does not exist."}, status=404
            )

        try:
            following = User.objects.get(id=following_id)
        except User.DoesNotExist:
            return JsonResponse(
                {"error": f"User with ID {following_id} does not exist."}, status=404
            )

        # follower = get_object_or_404(User, id=follower_id)
        # following = get_object_or_404(User, id=following_id)

        follow_relation, created = Follow.objects.get_or_create(
            follower=follower, following=following
        )

        if created:
            return JsonResponse(
                {
                    "message": f"{follower.username} is now following {following.username}."
                },
                status=201,
            )
        else:
            return JsonResponse({"message": "Already following this user."}, status=200)


@csrf_exempt
def unfollow_user(request):
    """
    API to unfollow a user
    """
    if request.method == "POST":
        data = json.loads(request.body)
        follower_id = data.get("followerId")
        following_id = data.get("followingId")

        # Check if follower and following users exist
        try:
            follower = User.objects.get(id=follower_id)
        except User.DoesNotExist:
            return JsonResponse(
                {"error": f"User with ID {follower_id} does not exist."}, status=404
            )

        try:
            following = User.objects.get(id=following_id)
        except User.DoesNotExist:
            return JsonResponse(
                {"error": f"User with ID {following_id} does not exist."}, status=404
            )

        # follower = get_object_or_404(User, id=follower_id)
        # following = get_object_or_404(User, id=following_id)

        follow_relation = Follow.objects.filter(follower=follower, following=following)
        if follow_relation.exists():
            follow_relation.delete()
            return JsonResponse(
                {
                    "message": f"{follower.username} has unfollowed {following.username}."
                },
                status=200,
            )
        else:
            return JsonResponse(
                {"error": "No such follow relationship exists."}, status=404
            )


def get_followers(request, user_id):
    """
    API to get a user's followers
    """
    # Check if user exists
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse(
            {"error": f"User with ID {user_id} does not exist."}, status=404
        )

    # user = get_object_or_404(User, id=user_id)
    followers = user.followers.all().values(
        "follower__id", "follower__username", "follower__email"
    )
    return JsonResponse({"followers": list(followers)}, status=200)


def get_followings(request, user_id):
    """
    API to get users a user is following
    """
    # Check if user exists
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse(
            {"error": f"User with ID {user_id} does not exist."}, status=404
        )

    # user = get_object_or_404(User, id=user_id)
    followings = user.following.all().values(
        "following__id", "following__username", "following__email"
    )
    return JsonResponse({"followings": list(followings)}, status=200)
