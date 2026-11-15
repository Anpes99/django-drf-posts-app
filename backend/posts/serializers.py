from rest_framework import serializers

from .models import Post


class CreatePostSerializer(serializers.ModelSerializer):

    class Meta:
        model = Post
        fields = ['title', 'text']


class UpdatePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['title', 'text']
        extra_kwargs = {
            'title': {'required': False},
            'text': {'required': False},
        }

    def validate(self, attrs):
        title = attrs.get('title')
        text = attrs.get('text')

        if 'title' not in attrs and 'text' not in attrs:
            raise serializers.ValidationError({
                'non_field_errors': 'At least one of title or text must be provided.'
            })
        return attrs


class ReadPostSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Post
        fields = ['id', 'author', 'title', 'text', 'created_at']
