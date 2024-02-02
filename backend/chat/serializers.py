from rest_framework import serializers
from .models import Messages


class MessageSerializer(serializers.ModelSerializer):
    message = serializers.CharField(max_length=128)

    class Meta:
        model = Messages
        fields = '__all__'


class RoomIdSerializer(serializers.Serializer):
    room_id = serializers.CharField(max_length=10)


class GetMessagesSerializer(serializers.ModelSerializer):
    chat_room = serializers.CharField(max_length=10)

    class Meta:
        model = Messages
        fields = '__all__'
