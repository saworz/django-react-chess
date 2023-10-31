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
        game = GameLoader(room_id=self.room_id)
        game.create_board()
        game.init_moves()
        return game

    def receive(self, text_data):
        """ Handles data sent in websocket """
        data_json = json.loads(text_data)
        if data_json['data_type'] == 'move':
            self.read_board_from_db()
            self.validate_move_request(data_json)
            self.save_board_state_to_db()
            self.read_board_from_db()
            self.send_board_state()
        elif data_json['data_type'] == 'init_board':
            initialized_game = self.initialize_board()
            self.save_board_state_to_db(initialized_game)
            read_game = self.read_board_from_db()
            self.send_board_state(read_game)

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

    def create_board_in_db(self, white_board, black_board):
        white_serializer = WhiteBoardSerializer(data=white_board)
        black_serializer = BlackBoardSerializer(data=black_board)

        white_serializer.is_valid(raise_exception=True)
        black_serializer.is_valid(raise_exception=True)

        white_serializer.save()
        black_serializer.save()

    def edit_board_in_db(self, white_board, black_board, game_id):
        white_board_instance = WhitePieces.objects.get(game_id=game_id)
        black_board_instance = BlackPieces.objects.get(game_id=game_id)

        for key, value in white_board.items():
            if not key == 'game_id':
                setattr(white_board_instance, key, value)

        for key, value in black_board.items():
            if not key == 'game_id':
                setattr(black_board_instance, key, value)

        white_board_instance.save()
        black_board_instance.save()

    def save_board_state_to_db(self, game):
        sides = {
            "white": game.white_pieces,
            "black": game.black_pieces
        }

        game_id = ChessGame.objects.get(room_id=self.room_id).pk
        white_board = {"game_id": game_id}
        black_board = {"game_id": game_id}

        for color, board in sides.items():
            for name, piece in board.items():
                piece_info = {
                    "piece_type": piece.piece_type,
                    "position": piece.position,
                    "color": piece.color,
                    "possible_moves": piece.possible_moves,
                    "capturing_moves": piece.capturing_moves,
                }

                if color == 'white':
                    white_board[name] = piece_info

                elif color == 'black':
                    black_board[name] = piece_info

        if WhitePieces.objects.filter(game_id=game_id).exists() and BlackPieces.objects.filter(game_id=game_id).exists():
            self.edit_board_in_db(white_board, black_board, game_id)
        else:
            self.create_board_in_db(white_board, black_board)

    def read_model_fields(self, model):
        read_data = {}
        for field in model._meta.get_fields():
            if field.concrete and not field.is_relation and not field.name == 'id':
                field_name = field.name
                field_value = getattr(model, field_name)
                deserialized_data = {}
                for key, value in field_value.items():
                    if isinstance(value, list):
                        data = self.deserialize_lists(value)
                    else:
                        data = value
                    deserialized_data[key] = data

                read_data[field_name] = deserialized_data
        return read_data

    def deserialize_lists(self, lst):
        """ Deserializes lists """
        result = []

        if len(lst) == 2 and not isinstance(lst[0], list):
            return lst[0], lst[1]

        for item in lst:
            if isinstance(item, list):
                result.append([tuple(subitem) for subitem in item])
        return result

    def add_moves_to_pieces(self, white_pieces_data, black_pieces_data):
        game = GameLoader(room_id=self.room_id)
        game.create_pieces_objects(white_pieces_data, black_pieces_data)
        game.init_moves()
        return game

    def read_board_from_db(self):
        game_id = ChessGame.objects.get(room_id=self.room_id).pk
        white_board = WhitePieces.objects.get(game_id=game_id)
        black_board = BlackPieces.objects.get(game_id=game_id)

        white_pieces_data = self.read_model_fields(white_board)
        black_pieces_data = self.read_model_fields(black_board)

        game = self.add_moves_to_pieces(white_pieces_data, black_pieces_data)
        return game

    def unpack_positions(self, moves):
        moves_list = []
        for sublist in moves:
            for move in sublist:
                moves_list.append(tuple(move))
        return moves_list

    def position_to_tuple(self, position):
        return int(position[0]), int(position[1])

    def validate_move_request(self, move_data):
        if move_data['color'] == 'white':
            piece = self.game.white_pieces[move_data['piece']]
        elif move_data['color'] == 'black':
            piece = self.game.black_pieces[move_data['piece']]

        new_position = self.position_to_tuple(move_data['new_position'])
        possible_positions = self.unpack_positions(piece.possible_moves)

        if new_position not in possible_positions:
            print("Incorrect request")
            return

        piece.position = new_position

    def prepare_data(self, pieces):
        prepared_data = {}
        for key, piece in pieces:
            prepared_data[key] = {'piece_type': piece.piece_type, 'position': piece.position, 'color': piece.color,
                                  'possible_moves': piece.possible_moves, 'capturing_moves': piece.capturing_moves}

        return prepared_data

    def send_board_state(self, game):
        white_pieces_data = self.prepare_data(game.white_pieces.items())
        black_pieces_data = self.prepare_data(game.black_pieces.items())

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_positions',
                'white_pieces': white_pieces_data,
                'black_pieces': black_pieces_data
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