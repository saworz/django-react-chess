import random
from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame
from .chess_logic import GameInitializer
from .serializers import ChessGameSerializer, BlackBoardSerializer, WhiteBoardSerializer
from django.contrib.auth.models import User
from asgiref.sync import async_to_sync
import json


class ChessConsumer(WebsocketConsumer):
    def create_new_game(self, enemy_id):
        logged_user = self.scope['user']
        other_user = User.objects.get(pk=enemy_id)

        players = [logged_user.pk, other_user.pk]
        random.shuffle(players)

        room_id = ''.join(sorted([str(logged_user.pk), str(other_user.pk)]))

        game_data = {
            "player_white": players[0],
            "player_black": players[1],
            "room_id": room_id
        }

        white_board = {
            "game_id": None,
        }

        black_board = {
            "game_id": None,
        }

        print("Created new game instance")
        self.new_game = GameInitializer()
        self.new_game.validate_moves()

    def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_name = self.room_id
        self.room_group_name = f"game_{self.room_id}"
        self.game = ChessGame.objects.filter(room_id=self.room_id).first()

        if self.game:
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name,
                self.channel_name
            )

            self.accept()

    def receive(self, text_data):
        data_json = json.loads(text_data)
        if data_json['data_type'] == 'move':
            self.update_game_state(data_json)
        elif data_json['data_type'] == 'enemy_id':
            self.create_new_game(data_json['enemy_id'])

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
        print(self.game)
        try:
            print(self.new_game)
            print(hex(id(self.new_game)))
        except:
            pass

    def disconnect(self, code):
        """ On ws disconnect deletes game assigned with the room_id """
        if self.game:
            self.game.delete()
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

