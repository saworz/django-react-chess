from rest_framework import serializers
from .forms import UserRegisterForm


class UserRegisterFormSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    email = serializers.CharField(max_length=100)
    password1 = serializers.CharField(max_length=128)
    password2 = serializers.CharField(max_length=128)

    def create(self, validated_data) -> UserRegisterForm:
        return UserRegisterForm(validated_data)


class MessageResponseSerializer(serializers.Serializer):
    message = serializers.CharField()


class UserErrorDictSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.CharField()
    password1 = serializers.CharField()
    password2 = serializers.CharField()


class UserErrorResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    errors = UserErrorDictSerializer()


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=128)


class UserDataDictSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.CharField()
    image_url = serializers.CharField()


class LoginSuccessResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    user = UserDataDictSerializer()
    jwt_access_token = serializers.CharField()
    jwt_refresh_token = serializers.CharField()
