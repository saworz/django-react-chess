from .models import ChessGame, WhitePieces, BlackPieces
from .serializers import BlackBoardSerializer, WhiteBoardSerializer
from .utils import deserialize_lists
from django.utils import timezone


class DatabaseHandler:
    """ Handles connection with database and saving/reading game state """
    def __init__(self, room_id, socket_data, game):
        self.room_id = room_id
        self.socket_data = socket_data
        self.game_object = game
        self.game = None
        self.game_instance = ChessGame.objects.get(room_id=self.room_id)
        self.game_id = self.game_instance.pk
        self.current_player = self.game_instance.current_player
        self.white_board = {}
        self.black_board = {}

    def save_board_state_to_db(self):
        """ Saves board state to database """
        self.game = self.game_object.game

        sides = {
            "white": self.game.white_pieces,
            "black": self.game.black_pieces
        }

        self.white_board = {"game_id": self.game_id}
        self.black_board = {"game_id": self.game_id}

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

        if WhitePieces.objects.filter(game_id=self.game_id).exists() and BlackPieces.objects.filter(
                game_id=self.game_id).exists():
            self.edit_board_in_db(self.white_board, self.black_board)
        else:
            self.create_board_in_db(self.white_board, self.black_board)

    def get_piece_info(self, piece: object, db_data: dict[str, str]) -> dict[str, str]:
        """ Unpacks data about piece from database """
        piece_info = db_data
        piece_info['illegal_moves'] = piece.illegal_moves
        piece_info['valid_moves'] = piece.valid_moves
        return piece_info

    def read_board_from_db(self) -> dict[str, str]:
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

    def edit_board_in_db(self, white_board, black_board):
        """ Edits pieces info in already existing table """
        white_board_instance = WhitePieces.objects.get(game_id=self.game_id)
        black_board_instance = BlackPieces.objects.get(game_id=self.game_id)

        existing_white_keys = [field.name for field in WhitePieces._meta.get_fields()]
        existing_black_keys = [field.name for field in BlackPieces._meta.get_fields()]

        keys_to_skip = ['game_id', 'castled', 'rook_1_moved', 'rook_2_moved', 'king_moved', 'en_passant_field']
        white_null_keys = []
        black_null_keys = []

        pieces_mapping = {
            "pawn_1": "pawn",
            "pawn_2": "pawn",
            "pawn_3": "pawn",
            "pawn_4": "pawn",
            "pawn_5": "pawn",
            "pawn_6": "pawn",
            "pawn_7": "pawn",
            "pawn_8": "pawn",
            "rook_1": "rook",
            "rook_2": "rook",
            "bishop_1": "bishop",
            "bishop_2": "bishop",
            "knight_1": "knight",
            "knight_2": "knight",
            "queen": "queen",
        }

        score_mapping = {
            "pawn": 1,
            "bishop": 3,
            "knight": 3,
            "rook": 5,
            "queen": 9,
        }

        for key in existing_white_keys:
            if key not in white_board and not key == 'id' and key not in keys_to_skip:
                setattr(white_board_instance, key, None)
                white_null_keys.append(key)

        for key in existing_black_keys:
            if key not in black_board and not key == 'id' and key not in keys_to_skip:
                setattr(black_board_instance, key, None)
                black_null_keys.append(key)

        for key in white_null_keys:
            piece_type = pieces_mapping[key]
            piece_value = score_mapping[piece_type]
            self.game.black_score += piece_value
            self.game.black_captured_pieces.append(piece_type)

        for key in black_null_keys:
            piece_type = pieces_mapping[key]
            piece_value = score_mapping[piece_type]
            self.game.white_score += piece_value
            self.game.white_captured_pieces.append(piece_type)

        for key, value in white_board.items():
            if not key == 'game_id':
                setattr(white_board_instance, key, value)

        for key, value in black_board.items():
            if not key == 'game_id':
                setattr(black_board_instance, key, value)

        if self.socket_data['data_type'] == 'move':
            data_type = self.socket_data['data_type']
            piece = self.socket_data['piece']
            color = self.socket_data['color']

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

            if self.game.white_pawn_en_passant_val:
                setattr(white_board_instance, 'en_passant_field', self.game.white_pawn_en_passant_field)
                setattr(black_board_instance, 'en_passant_field', None)
            elif self.game.black_pawn_en_passant_val:
                setattr(black_board_instance, 'en_passant_field', self.game.black_pawn_en_passant_field)
                setattr(white_board_instance, 'en_passant_field', None)
            else:
                setattr(black_board_instance, 'en_passant_field', None)
                setattr(white_board_instance, 'en_passant_field', None)

        white_board_instance.save()
        black_board_instance.save()

    def read_model_fields(self, model: object) -> tuple[dict, dict, str]:
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

    def update_player_turn(self):
        """ Change active player and update times left"""
        print('here')
        if self.game_instance.current_player == 'white':
            self.game_instance.current_player = 'black'

            if self.game_instance.waiting_for_first_move:
                self.game_instance.waiting_for_first_move = False
            else:
                self.game_instance.white_time -= (timezone.now() - self.game_instance.last_move)
        else:
            self.game_instance.current_player = 'white'
            self.game_instance.black_time -= (timezone.now() - self.game_instance.last_move)

        self.game_instance.last_move = timezone.now()
        self.game_instance.save()
