from .chess_game import GameHandler
from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame, WhitePieces, BlackPieces
from .chess_logic import GameLoader
from .serializers import BlackBoardSerializer, WhiteBoardSerializer
from .utils import (deserialize_lists, prepare_data,
                    get_valid_moves, add_en_passant_field)
from asgiref.sync import async_to_sync
import json


class DatabaseHandler:

    def __init__(self, room_id):
        self.room_id = room_id
        self.white_board = {}
        self.black_board = {}

    def save_board_state_to_db(self, game, socket_data=None):
        """ Saves board state to database """
        sides = {
            "white": game.white_pieces,
            "black": game.black_pieces
        }

        game_id = ChessGame.objects.get(room_id=self.room_id).pk
        current_player = ChessGame.objects.get(room_id=self.room_id).current_player
        self.white_board = {"game_id": game_id}
        self.black_board = {"game_id": game_id}

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
                    self.white_board[name] = piece_info
                elif color == 'black':
                    self.black_board[name] = piece_info

        if WhitePieces.objects.filter(game_id=game_id).exists() and BlackPieces.objects.filter(
                game_id=game_id).exists():
            self.edit_board_in_db(self.white_board, self.black_board, game_id, game, socket_data)
        else:
            self.create_board_in_db(self.white_board, self.black_board)

        return current_player

    def get_piece_info(self, piece, db_data):
        piece_info = db_data
        piece_info['illegal_moves'] = piece.illegal_moves
        piece_info['valid_moves'] = piece.valid_moves
        return piece_info

    def save_illegal_moves_to_db(self, game):
        white_pieces_dict = {field_name: value for field_name, value in
                             self.white_board.items() if field_name != "game_id"}
        black_pieces_dict = {field_name: value for field_name, value in
                             self.black_board.items() if field_name != "game_id"}

        new_white_board_data = {}
        new_black_board_data = {}

        for (db_field, db_data), (piece_name, piece) in zip(white_pieces_dict.items(), game.white_pieces.items()):
            new_white_board_data[db_field] = self.get_piece_info(piece, db_data)

        for (db_field, db_data), (piece_name, piece) in zip(black_pieces_dict.items(), game.black_pieces.items()):
            new_black_board_data[db_field] = self.get_piece_info(piece, db_data)

        game_id = ChessGame.objects.get(room_id=self.room_id).pk
        new_white_board_data['game_id'] = game_id
        new_black_board_data['game_id'] = game_id

        self.edit_board_in_db(new_white_board_data, new_black_board_data, game_id)

    def read_board_from_db(self):
        """ Reads pieces info from database """
        game_id = ChessGame.objects.get(room_id=self.room_id).pk
        white_board = WhitePieces.objects.get(game_id=game_id)
        black_board = BlackPieces.objects.get(game_id=game_id)

        white_pieces_data, white_castle_data, white_en_passant_field = self.read_model_fields(white_board)
        black_pieces_data, black_castle_data, black_en_passant_field = self.read_model_fields(black_board)

        game_data = {"white_pieces": white_pieces_data,
                     "white_castle": white_castle_data,
                     "white_en_passant_field": white_en_passant_field,
                     "black_pieces": black_pieces_data,
                     "black_castle": black_castle_data,
                     "black_en_passant_field": black_en_passant_field}
        return game_data

    def create_board_in_db(self, white_board, black_board):
        """ Creates tables for new game """
        white_serializer = WhiteBoardSerializer(data=white_board)
        black_serializer = BlackBoardSerializer(data=black_board)

        white_serializer.is_valid(raise_exception=True)
        black_serializer.is_valid(raise_exception=True)

        white_serializer.save()
        black_serializer.save()

    def edit_board_in_db(self, white_board, black_board, game_id, game=None, socket_data=None):
        """ Edits pieces info in already existing table """
        white_board_instance = WhitePieces.objects.get(game_id=game_id)
        black_board_instance = BlackPieces.objects.get(game_id=game_id)

        existing_white_keys = [field.name for field in WhitePieces._meta.get_fields()]
        existing_black_keys = [field.name for field in BlackPieces._meta.get_fields()]

        keys_to_skip = ['game_id', 'castled', 'rook_1_moved', 'rook_2_moved', 'king_moved', 'en_passant_field']
        for key in existing_white_keys:
            if key not in white_board and not key == 'id' and key not in keys_to_skip:
                setattr(white_board_instance, key, None)

        for key in existing_black_keys:
            if key not in black_board and not key == 'id' and key not in keys_to_skip:
                setattr(black_board_instance, key, None)

        for key, value in white_board.items():
            if not key == 'game_id':
                setattr(white_board_instance, key, value)

        for key, value in black_board.items():
            if not key == 'game_id':
                setattr(black_board_instance, key, value)

        if socket_data:
            data_type = socket_data['data_type']
            piece = socket_data['piece']
            color = socket_data['color']

            if data_type == 'move' and piece == 'rook_1' and color == 'white':
                setattr(white_board_instance, 'rook_1_moved', True)
            elif data_type == 'move' and piece == 'rook_2' and color == 'white':
                setattr(white_board_instance, 'rook_2_moved', True)
            elif data_type == 'move' and piece == 'rook_1' and color == 'black':
                setattr(black_board_instance, 'rook_1_moved', True)
            elif data_type == 'move' and piece == 'rook_2' and color == 'black':
                setattr(black_board_instance, 'rook_2_moved', True)
            elif data_type == 'move' and piece == 'king' and color == 'white':
                setattr(white_board_instance, 'king_moved', True)
            elif data_type == 'move' and piece == 'king' and color == 'black':
                setattr(black_board_instance, 'king_moved', True)

            if game.white_pawn_en_passant_val:
                setattr(white_board_instance, 'en_passant_field', game.white_pawn_en_passant_field)
                setattr(black_board_instance, 'en_passant_field', None)
            elif game.black_pawn_en_passant_val:
                setattr(black_board_instance, 'en_passant_field', game.black_pawn_en_passant_field)
                setattr(white_board_instance, 'en_passant_field', None)
            else:
                setattr(black_board_instance, 'en_passant_field', None)
                setattr(white_board_instance, 'en_passant_field', None)

        white_board_instance.save()
        black_board_instance.save()

    def read_model_fields(self, model):
        """ Saves model data as dict """
        pieces_data = {}
        castle_data = {}
        en_passant_field = None

        for field in model._meta.get_fields():
            field_name = field.name
            field_value = getattr(model, field_name)

            if field.concrete and not field.is_relation and not field.name == 'id' and not field.name == 'en_passant_field':
                deserialized_data = {}

                if field_value and not isinstance(field_value, bool):
                    for key, value in field_value.items():
                        if isinstance(value, list):
                            data = deserialize_lists(value)
                        else:
                            data = value
                        deserialized_data[key] = data

                    pieces_data[field_name] = deserialized_data

                if isinstance(field_value, bool):
                    castle_data[field_name] = field_value

            elif field.concrete and not field.is_relation and field.name == 'en_passant_field':
                en_passant_field = field_value

        return pieces_data, castle_data, en_passant_field