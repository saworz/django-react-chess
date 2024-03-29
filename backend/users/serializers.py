from rest_framework import serializers
from .forms import UserRegisterForm
from django.contrib.auth.models import User
from .models import Profile
from friends.models import FriendRequest
from django.contrib.auth.password_validation import validate_password
from PIL import Image


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
    id = serializers.CharField()
    username = serializers.CharField()
    email = serializers.CharField()
    image = serializers.CharField()


class LoggedUserSerializer(serializers.Serializer):

    id = serializers.ReadOnlyField(source='user.id')
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    image = serializers.SerializerMethodField()
    wins = serializers.IntegerField()
    losses = serializers.IntegerField()
    elo = serializers.IntegerField()

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'image', 'wins', 'losses', 'elo']

    def get_image(self, obj) -> str:
        if obj.image:
            return obj.image.url


class OtherUserSerializer(LoggedUserSerializer):
    is_friend = serializers.SerializerMethodField()
    pending_request = serializers.SerializerMethodField()
    request_sender_id = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['is_friend', 'pending_request', 'request_sender_id']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logged_user = None
        self.other_user = None

    def get_is_friend(self, obj) -> bool:
        self.logged_user = self.context['request'].user
        self.other_user = User.objects.get(pk=obj.id)

        if User.objects.get(pk=obj.id).profile in self.context['request'].user.profile.friends.all():
            return True
        return False

    def get_pending_request(self, obj) -> bool:

        if FriendRequest.objects.filter(from_user=self.logged_user, to_user=self.other_user).exists() or \
                FriendRequest.objects.filter(from_user=self.other_user, to_user=self.logged_user).exists():
            return True
        return False

    def get_request_sender_id(self, obj) -> str | None:
        pending_request = self.get_pending_request(obj)

        if pending_request:
            if FriendRequest.objects.filter(from_user=self.logged_user, to_user=self.other_user).exists():
                return self.logged_user.id
            return self.other_user.id


class UsersListSerializer(OtherUserSerializer):

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'image', 'is_friend', 'pending_request', 'request_sender_id']


class UpdateUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=32)
    email = serializers.CharField(max_length=32)
    image = serializers.ImageField(source='profile.image')

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'image']

    def get_image(self, obj) -> str:
        if obj.image:
            return obj.image.url

    def save(self):
        super().save()

        img = Image.open(self.image.path)

        if img.height > 300 or img.width > 300:
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.image.path)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    repeated_password = serializers.CharField(required=True)

    def validate_password(self, value):
        validate_password(value)
        return value


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'
