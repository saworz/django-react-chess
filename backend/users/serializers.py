from rest_framework import serializers
from .forms import UserRegisterForm


class UserRegisterFormSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    email = serializers.CharField(max_length=100)
    password1 = serializers.CharField(max_length=128)
    password2 = serializers.CharField(max_length=128)

    def create(self, validated_data):
        return UserRegisterForm(validated_data)

    def update(self, instance, validated_data):
        # Implement the logic to update user data based on the validated data.
        # Typically, you won't use this method for registration.
        pass


class UserSuccessResponseSerializer(serializers.Serializer):
    message = serializers.CharField()


class UserErrorDictSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.CharField()
    password1 = serializers.CharField()
    password2 = serializers.CharField()


class UserErrorResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    errors = UserErrorDictSerializer()

