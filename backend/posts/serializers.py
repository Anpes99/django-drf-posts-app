from rest_framework import serializers

from .models import Post


class CreatePostSerializer(serializers.ModelSerializer):

    class Meta:
        model = Post
        fields = ['title', 'text']


class UpdatePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['text']

class ReadPostSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Post
        fields = ['id', 'author', 'title', 'text', 'created_at']
