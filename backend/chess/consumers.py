import random
from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame, WhitePieces, BlackPieces
from .chess_logic import GameLoader
from .serializers import ChessGameSerializer, BlackBoardSerializer, WhiteBoardSerializer
from django.contrib.auth.models import User
from asgiref.sync import async_to_sync
import json


class GameDataHandler:
    def initialize_board(self):
        """ Initializes positions for a new game """
        game = GameLoader(room_id=self.room_id)
        game.create_board()
        game.init_moves()
        return game

    def create_board_in_db(self, white_board, black_board):
        """ Creates tables for new game """
        white_serializer = WhiteBoardSerializer(data=white_board)
        black_serializer = BlackBoardSerializer(data=black_board)

        white_serializer.is_valid(raise_exception=True)
        black_serializer.is_valid(raise_exception=True)

        white_serializer.save()
        black_serializer.save()

    def edit_board_in_db(self, white_board, black_board, game_id):
        """ Edits pieces info in already existing table """
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
        """ Saves board state to database """
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
        """ Saves model data as dict """
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
            if isinstance(item[0], int):
                result.append([(item[0], item[1])])
            elif isinstance(item, list):
                result.append([tuple(subitem) for subitem in item])
        return result

    def get_possible_moves(self, white_pieces_data, black_pieces_data):
        """ Gets list of possible_moves for each piece """
        game = GameLoader(room_id=self.room_id)
        game.create_pieces_objects(white_pieces_data, black_pieces_data)
        game.init_moves()
        return game

    def read_board_from_db(self):
        """ Reads pieces info from databse """
        game_id = ChessGame.objects.get(room_id=self.room_id).pk
        white_board = WhitePieces.objects.get(game_id=game_id)
        black_board = BlackPieces.objects.get(game_id=game_id)

        white_pieces_data = self.read_model_fields(white_board)
        black_pieces_data = self.read_model_fields(black_board)

        game = self.get_possible_moves(white_pieces_data, black_pieces_data)
        return game

    def unpack_positions(self, moves):
        """ Unpacks nested lists """
        moves_list = []
        for sublist in moves:
            for move in sublist:
                moves_list.append(tuple(move))
        return moves_list

    def position_to_tuple(self, position):
        """ Rewrites position (e.g. 45 to (4, 5)) """
        return int(position[0]), int(position[1])

    def validate_move_request(self, move_data, game):
        """ Checks whether the move request is valid """
        if move_data['color'] == 'white':
            piece = game.white_pieces[move_data['piece']]
        elif move_data['color'] == 'black':
            piece = game.black_pieces[move_data['piece']]

        new_position = self.position_to_tuple(move_data['new_position'])
        possible_positions = self.unpack_positions(piece.possible_moves)

        if new_position not in possible_positions:
            print("Incorrect request")
            return

        piece.position = new_position
        return game

    def prepare_data(self, pieces):
        """ Gets only specified data from pieces instances """
        prepared_data = {}
        for key, piece in pieces:
            prepared_data[key] = {'piece_type': piece.piece_type, 'position': piece.position, 'color': piece.color,
                                  'possible_moves': piece.possible_moves, 'capturing_moves': piece.capturing_moves}

        return prepared_data


class ChessConsumer(WebsocketConsumer, GameDataHandler):
    def connect(self):
        """ Handles websocket connection """
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
        """ Handles data sent in websocket """
        data_json = json.loads(text_data)
        if data_json['data_type'] == 'move':
            read_game = self.read_board_from_db()
            self.validate_move_request(data_json, read_game)
            read_game.init_moves()
            self.save_board_state_to_db(read_game)
            self.read_board_from_db()
            self.send_board_state(read_game)
        elif data_json['data_type'] == 'init_board':
            initialized_game = self.initialize_board()
            self.save_board_state_to_db(initialized_game)
            read_game = self.read_board_from_db()
            self.send_board_state(read_game)

    def send_board_state(self, game):
        """ Triggers send_positions with chess pieces data """
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
        """ Sends data about pieces on board """
        self.send(text_data=json.dumps({
            'white_pieces': event['white_pieces'],
            'black_pieces': event['black_pieces']
        }))

    def disconnect(self, code):
        """ Removes user from disconnected websocket """
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
