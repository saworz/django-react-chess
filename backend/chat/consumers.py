from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .serializers import MessageSerializer
from .models import ChatRooms
import json


class ChatConsumer(WebsocketConsumer):

    def connect(self):
        room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_name = room_id
        self.room_group_name = f"chat_{room_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': self.scope['user'].pk
            }
        )

    def save_chat_message(self, message):
        user = self.scope['user'].pk
        room_id = self.scope['url_route']['kwargs']['room_id']
        chat_room = ChatRooms.objects.get(room_id=room_id)
        data = {"sender": user, "chat_room": chat_room.pk, "message": message}
        serializer = MessageSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message,
            'sender': sender
        }))
        if self.scope['user'].pk == sender:
            self.save_chat_message(message)
