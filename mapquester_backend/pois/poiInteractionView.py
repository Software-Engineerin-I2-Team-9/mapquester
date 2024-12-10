from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import PoiInteractions, POI
from users.models import User

@api_view(['POST'])
def create_interaction(request):
    """
    API to create a reaction or comment on a POI.
    """
    data = request.data
    try:
        user = get_object_or_404(User, id=data['userId'])
        poi = get_object_or_404(POI, id=data['poiId'])
        interactionType = data['interactionType']
        content = data.get('content', None) if interactionType == 'comment' else None

        if interactionType not in ['reaction', 'comment']:
            return Response({"error": "Invalid interactionType. Must be 'reaction' or 'comment'."},
                            status=status.HTTP_400_BAD_REQUEST)

        if interactionType == 'comment' and not content:
            return Response({"error": "Content is required for comments."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Check if the user already has a reaction for the same POI
        existing_reaction = PoiInteractions.objects.filter(
            userId=user, poiId=poi, interactionType='reaction'
        ).first()

        if interactionType == 'reaction':
            if existing_reaction:
                # Remove the reaction
                existing_reaction.delete()
                poi.reactions = max(0, poi.reactions - 1)
                poi.save()
                return Response({"message": "Reaction removed successfully"},
                                status=status.HTTP_200_OK)
            else:
                # Create a new reaction
                interaction = PoiInteractions.objects.create(
                    userId=user,
                    poiId=poi,
                    interactionType=interactionType
                )
                poi.reactions += 1
                poi.save()
                return Response({"message": "Reaction added successfully", "interaction_id": interaction.id},
                                status=status.HTTP_201_CREATED)

        interaction = PoiInteractions.objects.create(
            userId=user,
            poiId=poi,
            interactionType=interactionType,
            content=content
        )

        return Response({"message": "Interaction created successfully", "interaction_id": interaction.id},
                        status=status.HTTP_201_CREATED)

    except KeyError as e:
        return Response({"error": f"Missing required field: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def list_interactions(request, poi_id):
    """
    API to list all interactions for a specific POI.
    """
    try:
        poi = get_object_or_404(POI, id=poi_id)
        interactions = PoiInteractions.objects.filter(poiId=poi).order_by('-createdAt')
        response_data = [
            {
                "id": interaction.id,
                "userId": interaction.userId.id,
                "interactionType": interaction.interactionType,
                "content": interaction.content,
                "createdAt": interaction.createdAt,
                "updatedAt": interaction.updatedAt
            }
            for interaction in interactions
        ]
        return Response(response_data, status=status.HTTP_200_OK)

    except POI.DoesNotExist:
        return Response({"error": "POI not found"}, status=status.HTTP_404_NOT_FOUND)
