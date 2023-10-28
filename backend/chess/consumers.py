import random
from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame
from .chess_logic import GameInitializer
from .serializers import ChessGameSerializer, BlackBoardSerializer, WhiteBoardSerializer
from django.contrib.auth.models import User
from asgiref.sync import async_to_sync
import json


class ChessConsumer(WebsocketConsumer):

    def save_game_to_db(self, game_data):
        sides = {
            "white": self.game.white_pieces,
            "black": self.game.black_pieces
        }

        white_board = {
            "game_id": None,
        }

        black_board = {
            "game_id": None,
        }

        for color, board in sides.items():
            for name, piece in board.items():
                piece_info = {
                    "name": name,
                    "position": piece.position,
                    "weight": piece.weight,
                    "possible_moves": piece.possible_moves,
                    "capturing_moves": piece.capturing_moves,
                    "color": piece.color,
                }

                if color == 'white':
                    white_board[name] = piece_info

                elif color == 'black':
                    black_board[name] = piece_info

        serializer = ChessGameSerializer(data=game_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        white_board["game_id"] = serializer.data["id"]
        black_board["game_id"] = serializer.data["id"]

        white_serializer = WhiteBoardSerializer(data=white_board)
        black_serializer = BlackBoardSerializer(data=black_board)

        white_serializer.is_valid(raise_exception=True)
        black_serializer.is_valid(raise_exception=True)

        white_serializer.save()
        black_serializer.save()

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

        print("Created new game instance")
        self.game = GameInitializer()
        self.game.validate_moves()

        if not ChessGame.objects.filter(room_id=self.room_id).exists():
            self.save_game_to_db(game_data)

    def get_enemy_id(self):
        user = self.scope['user'].pk
        room_id = self.scope['url_route']['kwargs']['room_id']

        if str(user) == str(room_id)[:len(str(user))]:
            enemy_id = int(str(room_id)[len(str(user)):])
        else:
            if len(str(room_id)) == 2:
                enemy_id = int(str(room_id)[0])
            else:
                enemy_id = int(str(room_id)[:len(str(user)) - 1])

        return enemy_id

    def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_name = self.room_id
        self.room_group_name = f"game_{self.room_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.create_new_game(self.get_enemy_id())
        self.accept()

    def receive(self, text_data):
        data_json = json.loads(text_data)
        if data_json['data_type'] == 'move':
            self.update_game_state(data_json)
            print(self.game)
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
        try:
            print(self.game)
            print(hex(id(self.game)))
        except:
            pass

    def disconnect(self, code):
        """ On ws disconnect deletes game assigned with the room_id """
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

