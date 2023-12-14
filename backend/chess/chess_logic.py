from .chess_pieces import PiecePawn, PieceRook, PieceBishop, PieceKnight, PieceKing, PieceQueen
from .models import WhitePieces, BlackPieces, ChessGame
from .utils import unpack_positions


class GameLoader:
    def __init__(self, room_id):
        super().__init__()
        self.room_id = room_id
        self.game = ChessGame.objects.filter(room_id=self.room_id).first()
        self.white_pieces = {}
        self.black_pieces = {}
        self.white_check = False
        self.white_checkmate = False
        self.black_check = False
        self.black_checkmate = False

    def get_board_state(self):
        whites_state = {}
        blacks_state = {}
        for name, piece in self.white_pieces.items():
            whites_state[name] = piece

        for name, piece in self.black_pieces.items():
            blacks_state[name] = piece

        return {"board_state": {"white": whites_state, "black": blacks_state}}

    def init_moves(self):
        black_board = self.get_board_state().get('board_state').get('black')
        white_board = self.get_board_state().get('board_state').get('white')

        for name, piece in black_board.items():
            piece.reload_position()
            piece.move_validator(white_board, black_board)
            # if self.black_check:
            #     piece.king_defensive_moves(white_board, black_board)

        for name, piece in white_board.items():
            piece.reload_position()
            piece.move_validator(white_board, black_board)
            # if self.white_check:
            #     piece.king_defensive_moves(white_board, black_board)

    def piece_object_loop(self, data, attribute):
        class_mapping = {
            "pawn": PiecePawn,
            "rook": PieceRook,
            "bishop": PieceBishop,
            "knight": PieceKnight,
            "queen": PieceQueen,
            "king": PieceKing

        }

        white_base_positions = {
            "pawn_1": (1, 2),
            "pawn_2": (2, 2),
            "pawn_3": (3, 2),
            "pawn_4": (4, 2),
            "pawn_5": (5, 2),
            "pawn_6": (6, 2),
            "pawn_7": (7, 2),
            "pawn_8": (8, 2),
            "rook_1": (1, 1),
            "rook_2": (8, 1),
            "knight_1": (2, 1),
            "knight_2": (7, 1),
            "bishop_1": (3, 1),
            "bishop_2": (6, 1),
            "queen": (4, 1),
            "king": (5, 1),
        }

        black_base_positions = {
            "pawn_1": (1, 7),
            "pawn_2": (2, 7),
            "pawn_3": (3, 7),
            "pawn_4": (4, 7),
            "pawn_5": (5, 7),
            "pawn_6": (6, 7),
            "pawn_7": (7, 7),
            "pawn_8": (8, 7),
            "rook_1": (1, 1),
            "rook_2": (8, 1),
            "knight_1": (2, 8),
            "knight_2": (7, 8),
            "bishop_1": (3, 8),
            "bishop_2": (6, 8),
            "queen": (4, 8),
            "king": (5, 8),
        }

        for piece, value in data:
            if not piece == "id":
                piece_type = value["piece_type"]
                piece_position = value["position"]
                piece_color = value["color"]
                piece_class = class_mapping[piece_type]

                if piece_color == 'white':
                    piece_base_position = white_base_positions[piece]
                elif piece_color == 'black':
                    piece_base_position = black_base_positions[piece]

                attribute[piece] = piece_class(piece_base_position, piece_position, piece_color)

    def create_pieces_objects(self, white_data, black_data):
        self.piece_object_loop(white_data.items(), self.white_pieces)
        self.piece_object_loop(black_data.items(), self.black_pieces)

    def create_board(self):

        white_pieces_initial_data = {
            "pawn_1": {"piece_type": "pawn", "position": (1, 2), "color": "white"},
            "pawn_2": {"piece_type": "pawn", "position": (2, 2), "color": "white"},
            "pawn_3": {"piece_type": "pawn", "position": (3, 2), "color": "white"},
            "pawn_4": {"piece_type": "pawn", "position": (4, 2), "color": "white"},
            "pawn_5": {"piece_type": "pawn", "position": (5, 2), "color": "white"},
            "pawn_6": {"piece_type": "pawn", "position": (6, 2), "color": "white"},
            "pawn_7": {"piece_type": "pawn", "position": (7, 2), "color": "white"},
            "pawn_8": {"piece_type": "pawn", "position": (8, 2), "color": "white"},
            "rook_1": {"piece_type": "rook", "position": (1, 1), "color": "white"},
            "rook_2": {"piece_type": "rook", "position": (8, 1), "color": "white"},
            "bishop_1": {"piece_type": "bishop", "position": (3, 1), "color": "white"},
            "bishop_2": {"piece_type": "bishop", "position": (6, 1), "color": "white"},
            "knight_1": {"piece_type": "knight", "position": (2, 1), "color": "white"},
            "knight_2": {"piece_type": "knight", "position": (7, 1), "color": "white"},
            "queen": {"piece_type": "queen", "position": (4, 1), "color": "white"},
            "king": {"piece_type": "king", "position": (5, 1), "color": "white"},
        }

        black_pieces_initial_data = {
            "pawn_1": {"piece_type": "pawn", "position": (1, 7), "color": "black"},
            "pawn_2": {"piece_type": "pawn", "position": (2, 7), "color": "black"},
            "pawn_3": {"piece_type": "pawn", "position": (3, 7), "color": "black"},
            "pawn_4": {"piece_type": "pawn", "position": (4, 7), "color": "black"},
            "pawn_5": {"piece_type": "pawn", "position": (5, 7), "color": "black"},
            "pawn_6": {"piece_type": "pawn", "position": (6, 7), "color": "black"},
            "pawn_7": {"piece_type": "pawn", "position": (7, 7), "color": "black"},
            "pawn_8": {"piece_type": "pawn", "position": (8, 7), "color": "black"},
            "rook_1": {"piece_type": "rook", "position": (1, 8), "color": "black"},
            "rook_2": {"piece_type": "rook", "position": (8, 8), "color": "black"},
            "bishop_1": {"piece_type": "bishop", "position": (3, 8), "color": "black"},
            "bishop_2": {"piece_type": "bishop", "position": (6, 8), "color": "black"},
            "knight_1": {"piece_type": "knight", "position": (2, 8), "color": "black"},
            "knight_2": {"piece_type": "knight", "position": (7, 8), "color": "black"},
            "queen": {"piece_type": "queen", "position": (4, 8), "color": "black"},
            "king": {"piece_type": "king", "position": (5, 8), "color": "black"},
        }

        self.create_pieces_objects(white_pieces_initial_data, black_pieces_initial_data)

    def check_king_safety(self):
        white_king_position = self.white_pieces['king'].position
        black_king_position = self.black_pieces['king'].position
        self.black_check = False
        self.white_check = False

        for name, piece in self.white_pieces.items():
            if black_king_position in piece.capturing_moves:
                self.black_check = True

        for name, piece in self.black_pieces.items():
            if white_king_position in piece.capturing_moves:
                self.white_check = True
