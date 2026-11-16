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

class VoteSerializer(serializers.Serializer):
    value = serializers.ChoiceField(choices=[1, -1, 0], help_text='1 = upvote, -1 = downvote, 0 = remove vote')


class ReadPostSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    
    # Set by PostQuerySet.with_my_vote(); 0 when the post wasn't loaded through it (e.g. just created).
    my_vote = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Post
        fields = ['id', 'author', 'title', 'text', 'created_at', 'upvotes', 'downvotes', 'my_vote']
