from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Post
from .serializers import CreatePostSerializer, ReadPostSerializer


class PostView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        posts = Post.objects.select_related('author').order_by('-created_at')
        return Response(ReadPostSerializer(posts, many=True).data)

    def post(self, request):
        serializer = CreatePostSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        post = serializer.save(author=request.user)
        return Response(ReadPostSerializer(post).data, status=status.HTTP_201_CREATED)
