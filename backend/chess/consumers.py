import random
from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame, WhitePieces, BlackPieces
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

    # def deserialize_lists(self, lst):
    #     """ Deserializes lists """
    #     result = []
    #
    #     if len(lst) == 2 and not isinstance(lst[0], list):
    #         return lst[0], lst[1]
    #
    #     for item in lst:
    #         if isinstance(item, list):
    #             result.append([tuple(subitem) for subitem in item])
    #     return result
    #
    # def read_pieces_positions(self, pieces_model, pieces_attribute):
    #     """ Saves current pieces positions from database """
    #     model_fields = pieces_model._meta.get_fields()
    #     for field in model_fields:
    #         deserialized_piece_data = {}
    #         if not field.is_relation and field.name != 'id':
    #             field_data = getattr(pieces_model, field.name)
    #             for piece_key, piece_data in field_data.items():
    #                 if isinstance(piece_data, list):
    #                     deserialized_positions = self.deserialize_lists(piece_data)
    #                     deserialized_piece_data[piece_key] = deserialized_positions
    #                 else:
    #                     deserialized_piece_data[piece_key] = piece_data
    #
    #             pieces_attribute[field.name] = deserialized_piece_data
    #
    # def get_board(self):
    #     """ Initializes board """
    #     self.game = GameLoader(room_id=self.room_id)
    #     self.game.read_pieces_info()
    #     self.read_pieces_positions(self.game.white_pieces_model, self.game.white_pieces_data)
    #     self.read_pieces_positions(self.game.black_pieces_model, self.game.black_pieces_data)

    def initialize_board(self):
        self.game = GameLoader(room_id=self.room_id)
        self.game.create_board()

    def receive(self, text_data):
        """ Handles data sent in websocket """
        data_json = json.loads(text_data)
        if data_json['data_type'] == 'move':
            self.make_move(data_json)
            self.read_positions()
        elif data_json['data_type'] == 'init_board':
            self.initialize_board()
            self.jsonify_board_state()

    # def unpack_positions(self, moves):
    #     moves_list = []
    #     for sublist in moves:
    #         for move in sublist:
    #             moves_list.append(tuple(move))
    #     return moves_list

    # def position_to_tuple(self, position):
    #     return int(position[0]), int(position[1])

    # def make_move(self, move_data):
    #     """ Changes piece position """
    #     game_model = ChessGame.objects.get(room_id=self.room_id)
    #     white_pieces = WhitePieces.objects.get(game_id=game_model.pk)
    #     black_pieces = BlackPieces.objects.get(game_id=game_model.pk)
    #
    #     if move_data['color'] == 'white':
    #         piece = getattr(white_pieces, move_data['piece'])
    #     elif move_data['color'] == 'black':
    #         piece = getattr(black_pieces, move_data['piece'])
    #
    #     piece_new_position = self.position_to_tuple(move_data['new_position'])
    #     piece_valid_moves = self.unpack_positions(piece.get('possible_moves'))
    #     if piece_new_position not in piece_valid_moves:
    #         print("bad move")
    #         return
    #
    #     self.game.white_pieces_data[move_data['piece']]['position'] = piece_new_position
    #     self.game.validate_moves()

    def save_board_to_db(self, white_board, black_board):
        white_serializer = WhiteBoardSerializer(data=white_board)
        black_serializer = BlackBoardSerializer(data=black_board)

        white_serializer.is_valid(raise_exception=True)
        black_serializer.is_valid(raise_exception=True)

        white_serializer.save()
        black_serializer.save()
        print("saved data to db")
    def jsonify_board_state(self):
        sides = {
            "white": self.game.white_pieces,
            "black": self.game.black_pieces
        }

        game_id = ChessGame.objects.get(room_id=self.room_id).pk
        white_board = {"game_id": game_id}
        black_board = {"game_id": game_id}

        for color, board in sides.items():
            for name, piece in board.items():
                piece_info = {
                    "position": piece.position,
                    "color": piece.color,
                }

                if color == 'white':
                    white_board[name] = piece_info

                elif color == 'black':
                    black_board[name] = piece_info

        self.save_board_to_db(white_board, black_board)

    def read_positions(self):
        """ Triggers sending pieces data """
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_positions',
                'white_pieces': self.game.white_pieces,
                'black_pieces': self.game.black_pieces
            }
        )

    def send_positions(self, event):
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

