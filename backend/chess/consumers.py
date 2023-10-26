import random
from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame
from .chess_logic import GameInitializer
from .serializers import ChessGameSerializer, BlackBoardSerializer, WhiteBoardSerializer
from django.contrib.auth.models import User
from asgiref.sync import async_to_sync
import json


class ChessConsumer(WebsocketConsumer):

    def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_name = self.room_id
        self.room_group_name = f"game_{self.room_id}"
        self.game = ChessGame.objects.filter(room_id=self.room_id).first()

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def receive(self, text_data):
        data_json = json.loads(text_data)
        self.update_game_state(data_json)

    def update_game_state(self, updates):
        """ Sends the current game state to all users in the group """
        print(updates)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'game_update',
                'message': "new game state",
            }
        )

    def disconnect(self, code):
        """ On ws disconnect deletes game assigned with the room_id """
        if self.game:
            self.game.delete()
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

