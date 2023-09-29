from rest_framework import serializers
from users.models import Profile
from django.contrib.auth.models import User


class CoupledUsersSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='pk')
    logged_user = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'logged_user', 'other_user']

    def get_logged_user(self, obj):
        return self.context['request'].user

    def get_other_user(self, obj):
        return User.objects.get(pk=obj.id)


class FriendsRequestSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='user.id')

    class Meta:
        model = Profile
        fields = ['id']
