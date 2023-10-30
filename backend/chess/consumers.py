import random
from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame
from .chess_logic import GameInitializer, GameLoader
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

    def deserialize_lists(self, lst):
        """ Deserializes lists """
        result = []

        if len(lst) == 2 and not isinstance(lst[0], list):
            return lst[0], lst[1]

        for item in lst:
            if isinstance(item, list):
                result.append([tuple(subitem) for subitem in item])
        return result

    def read_pieces_positions(self, pieces_model, pieces_attribute):
        """ Saves current pieces positions from database """
        model_fields = pieces_model._meta.get_fields()
        for field in model_fields:
            deserialized_piece_data = {}
            if not field.is_relation and field.name != 'id':
                field_data = getattr(pieces_model, field.name)
                for piece_key, piece_data in field_data.items():
                    if isinstance(piece_data, list):
                        deserialized_positions = self.deserialize_lists(piece_data)
                        deserialized_piece_data[piece_key] = deserialized_positions
                    else:
                        deserialized_piece_data[piece_key] = piece_data

                pieces_attribute[field.name] = deserialized_piece_data

    def init_board(self):
        """ Initializes board """
        self.game = GameLoader(room_id=self.room_id)
        self.game.read_pieces_info()
        self.read_pieces_positions(self.game.white_pieces_model, self.game.white_pieces)
        self.read_pieces_positions(self.game.black_pieces_model, self.game.black_pieces)

    def receive(self, text_data):
        """ Handles data sent in websocket """
        data_json = json.loads(text_data)
        if data_json['data_type'] == 'move':
            pass
        elif data_json['data_type'] == 'init_board':
            self.init_board()
            self.send_initial_positions()

    def send_initial_positions(self):
        """ Triggers initial board state send """
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'initial_board_state',
                'white_pieces': self.game.white_pieces,
                'black_pieces': self.game.black_pieces
            }
        )

    def initial_board_state(self, event):
        """ Sends the initial game state """
        self.send(text_data=json.dumps({
            'white_pieces': event['white_pieces'],
            'black_pieces': event['black_pieces']
        }))

    def disconnect(self, code):
        """ On ws disconnect deletes game assigned with the room_id """
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

