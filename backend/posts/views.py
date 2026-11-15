from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from .models import Post
from .serializers import CreatePostSerializer, UpdatePostSerializer, ReadPostSerializer
from .pagination import PostPagination
from .permissions import IsAuthorOrReadOnly

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.select_related('author').order_by('-created_at')
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'text']

    pagination_class = PostPagination

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreatePostSerializer
        return ReadPostSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        post = serializer.save(author=request.user)
        return Response(ReadPostSerializer(post).data, status=status.HTTP_201_CREATED)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.select_related('author')
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return UpdatePostSerializer
        return ReadPostSerializer

    def update(self, request, *args, **kwargs):
        post = self.get_object()  # also runs the author permission check
        serializer = self.get_serializer(post, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        post = serializer.save()
        return Response(ReadPostSerializer(post).data)
