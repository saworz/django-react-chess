from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .serializers import MessageSerializer
from .models import ChatRooms
import json


class PrivateChatConsumer(WebsocketConsumer):
    """Consumer responsible for private chat opened from friends menu"""
    def connect(self):
        self.other_user_id = self.scope['url_route']['kwargs']['other_user_id']
        self.logged_user_id = self.scope['user'].pk
        self.room_id = ''.join(sorted([str(self.logged_user_id), str(self.other_user_id)]))
        self.room_name = self.room_id
        self.room_group_name = f"private_chat_{self.room_id}"

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
        chat_room = ChatRooms.objects.get(room_id=self.room_id)
        data = {"sender": self.logged_user_id, "chat_room": chat_room.pk, "message": message}
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


class GameChatConsumer(WebsocketConsumer):
    """Consumer responsible for in-game chat"""
    def connect(self):
        room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_name = room_id
        self.room_group_name = f"game_chat_{room_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def receive(self, text_data):
        data_json = json.loads(text_data)

        if data_json['data_type'] == 'chat_message':
            self.trigger_send_message(data_json['message'])

    def trigger_send_message(self, message):
        """ Triggers sending message via websocket """
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_message',
                'message': message,
                'sender': self.scope['user'].pk
            }
        )

    def send_message(self, event):
        """ Sends chat message """
        self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender': event['sender']
        }))
