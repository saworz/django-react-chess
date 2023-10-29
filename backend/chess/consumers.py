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

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        if ChessGame.objects.filter(room_id=self.room_id).exists():
            self.accept()

    def receive(self, text_data):
        data_json = json.loads(text_data)
        if data_json['data_type'] == 'move':
            self.update_game_state(data_json)
        elif data_json['data_type'] == 'enemy_id':
            pass

    def update_game_state(self, updates):
        """ Triggers game update """
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'game_update',
                'updates': updates,
            }
        )

    def game_update(self, event):
        """ Sends the current game state to all users in the group """
        ###### For debugging - to delete
        self.send(text_data=json.dumps({
            'piece': event['updates']['piece'],
            'color': event['updates']['color'],
            'new_position': event['updates']['new_position']
        }))

    def disconnect(self, code):
        """ On ws disconnect deletes game assigned with the room_id """
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

