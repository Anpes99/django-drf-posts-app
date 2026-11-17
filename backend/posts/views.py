from django.shortcuts import get_object_or_404
from rest_framework import generics, status, filters
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Comment, Post
from .serializers import CreateCommentSerializer, ReadCommentSerializer, CreatePostSerializer,  UpdatePostSerializer, ReadPostSerializer, VoteSerializer
from .services import cast_vote
from .pagination import CommentPagination, PostPagination
from .permissions import IsAuthorOrReadOnly

class PostListCreateView(generics.ListCreateAPIView):
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'text']

    pagination_class = PostPagination

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Post.objects.select_related('author').with_my_vote(self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreatePostSerializer
        return ReadPostSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post = serializer.save(author=request.user)
        return Response(ReadPostSerializer(post).data, status=status.HTTP_201_CREATED)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        return Post.objects.select_related('author').with_my_vote(self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return UpdatePostSerializer
        return ReadPostSerializer

    def update(self, request, *args, **kwargs):
        post = self.get_object()  # also runs the author permission check
        serializer = self.get_serializer(post, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        post = serializer.save()
        return Response(ReadPostSerializer(post).data)


class PostVoteView(APIView):
    """PUT {"value": 1 | -1 | 0} sets the current user's vote; 0 removes it. Idempotent."""
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        serializer = VoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            cast_vote(request.user, pk, serializer.validated_data['value'])
        except Post.DoesNotExist:
            raise NotFound('Post not found.')

        post = Post.objects.select_related('author').with_my_vote(request.user).get(pk=pk)
        return Response(ReadPostSerializer(post).data)


class PostCommentListCreateView(generics.ListCreateAPIView):
    """GET a post's comments (newest first, cursor-paginated) / POST a new comment."""
    pagination_class = CommentPagination
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_post(self):
        return get_object_or_404(Post, pk=self.kwargs['pk'])  # 404 for a missing post, not an empty list

    def get_queryset(self):
        return Comment.objects.filter(post=self.get_post()).select_related('author')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateCommentSerializer
        return ReadCommentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment = serializer.save(post=self.get_post(), author=request.user)
        return Response(ReadCommentSerializer(comment).data, status=status.HTTP_201_CREATED)
