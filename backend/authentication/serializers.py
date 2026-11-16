from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'password']

    def validate(self, attrs):
        # Run Django's password validators against an unsaved user so the
        # similarity validator can compare the password with the username.
        user = User(username=attrs.get('username'))
        try:
            validate_password(attrs['password'], user=user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': e.messages})
        return attrs

    def create(self, validated_data):
        # create_user() hashes the password; the default create() would store it in plain text.
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False, style={'input_type': 'password'})
