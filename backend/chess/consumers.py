import random
from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame
from .chess_logic import GameInitializer
from .serializers import ChessGameSerializer, BlackBoardSerializer, WhiteBoardSerializer
from django.contrib.auth.models import User
from asgiref.sync import async_to_sync
import json


class ChessConsumer(WebsocketConsumer):

    def create_game(self):
        self.serializer = ChessGameSerializer

        logged_user = self.scope['user']
        try:
            other_user = User.objects.get(pk=self.enemy_id)
        except User.DoesNotExist:
            self.send({
                "type": "error",
                "message": f"User with id {self.enemy_id} not found"
            })

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

        new_game = GameInitializer()
        new_game.validate_moves()

        sides = {
            "white": new_game.white_pieces,
            "black": new_game.black_pieces
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

        serializer = self.serializer(data=game_data)
        serializer.is_valid(raise_exception=True)
        self.game = serializer.save()

        white_board["game_id"] = serializer.data["id"]
        black_board["game_id"] = serializer.data["id"]

        white_serializer = WhiteBoardSerializer(data=white_board)
        black_serializer = BlackBoardSerializer(data=black_board)

        white_serializer.is_valid(raise_exception=True)
        black_serializer.is_valid(raise_exception=True)

        white_serializer.save()
        black_serializer.save()

    def connect(self):
        self.enemy_id = self.scope['url_route']['kwargs']['enemy_id']
        self.room_name = self.enemy_id
        self.room_group_name = f"game_{self.enemy_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        try:
            self.create_game()
            self.accept()
        except:
            self.send({
                "type": "error",
                "message": f"Failed to connect to the websocket"
            })

    def receive(self, text_data):
        data_json = json.loads(text_data)
        print(data_json)

    def disconnect(self, code):
        """ On ws disconnect deletes game assigned with the room_id """
        print(f"Disconnecting {self.game}")
        self.game.delete()
