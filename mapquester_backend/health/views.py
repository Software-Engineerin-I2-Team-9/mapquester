from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def root_view(request):
    return Response({
        "status": "ok",
        "message": "MapQuester API is running"
    })