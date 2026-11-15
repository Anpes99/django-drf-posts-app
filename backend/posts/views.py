from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import CreatePostSerializer, ReadPostSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post_view(request):
    serializer = CreatePostSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    post = serializer.save(author=request.user)
    return Response(ReadPostSerializer(post).data, status=status.HTTP_201_CREATED)
