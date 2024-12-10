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

        # Check if the follow relationship already exists
        follow_relation = Follow.objects.filter(follower=follower, following=following)
        if follow_relation.exists():
            # Unfollow if already following
            follow_relation.delete()
            return JsonResponse(
                {
                    "message": f"{follower.username} has unfollowed {following.username}."
                },
                status=200,
            )
        else:
            # Follow if not already following
            Follow.objects.create(follower=follower, following=following)
            return JsonResponse(
                {
                    "message": f"{follower.username} is now following {following.username}."
                },
                status=201,
            )


def get_followers_or_followings(request, user_id):
    """
    API to get a user's followers or followings based on a query parameter.
    Query Parameter:
    - `type`: "followers" or "followings"
    """
    request_type = request.GET.get("mode")

    # Validate the user_type parameter
    if request_type not in ["followers", "followings"]:
        return JsonResponse(
            {"error": "Invalid type. Allowed values are 'followers' or 'followings'."},
            status=400,
        )

    # Check if the user exists
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse(
            {"error": f"User with ID {user_id} does not exist."}, status=404
        )

    if request_type == "followers":
        data = user.followers.all().values(
            "follower__id", "follower__username", "follower__email"
        )
        return JsonResponse({"followers": list(data)}, status=200)

    elif request_type == "followings":
        data = user.following.all().values(
            "following__id", "following__username", "following__email"
        )
        return JsonResponse({"followings": list(data)}, status=200)
