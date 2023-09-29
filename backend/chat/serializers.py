from rest_framework import serializers
from users.models import Profile
from django.contrib.auth.models import User
from .models import Messages


class MessagesSerializer(serializers.ModelSerializer):
    message = serializers.CharField()

    class Meta:
        model = Messages
        fields = ['message']

    def create(self, validated_data):
        instance = Messages(
            message=validated_data['message'],
            from_user=validated_data['logged_user'],
            to_user=User.objects.get(pk=self.context.get('pk'))
        )
        instance.save()
        return instance


class GetMessageSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField()

    class Meta:
        model = Messages
        fields = ['pk', 'message', 'from_user', 'to_user', 'timestamp']
