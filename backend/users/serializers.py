from rest_framework import serializers
from .forms import UserRegisterForm
from django.contrib.auth.models import User
from .models import Profile
from friends.models import FriendRequest


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


class LoggedUserSerializer(serializers.Serializer):
    id = serializers.ReadOnlyField(source='user.id')
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    image = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'image']

    def get_image(self, obj) -> str:
        if obj.image:
            return obj.image.url


class OtherUserSerializer(LoggedUserSerializer):
    is_friend = serializers.SerializerMethodField()
    pending_request = serializers.SerializerMethodField()
    request_sender = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'image', 'is_friend', 'pending_request', 'request_sender']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logged_user = None
        self.other_user = None

    def get_is_friend(self, obj) -> bool:
        self.logged_user = self.context['request'].user
        self.other_user = User.objects.get(pk=obj.id)

        if User.objects.get(pk=obj.id) in self.context['request'].user.profile.friends.all():
            return True
        return False

    def get_pending_request(self, obj) -> bool:

        if FriendRequest.objects.filter(from_user=self.logged_user, to_user=self.other_user).exists() or \
                FriendRequest.objects.filter(from_user=self.other_user, to_user=self.logged_user).exists():
            return True
        return False

    def get_request_sender(self, obj) -> str | None:
        pending_request = self.get_pending_request(obj)

        if pending_request:
            if FriendRequest.objects.filter(from_user=self.logged_user, to_user=self.other_user).exists():
                return self.logged_user.username
            return self.other_user.username


class UsersListSerializer(OtherUserSerializer):

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'image', 'is_friend', 'pending_request', 'request_sender']

