from .chess_pieces import PiecePawn, PieceRook, PieceBishop, PieceKnight, PieceKing, PieceQueen
from .models import WhitePieces, BlackPieces, ChessGame


# class InitPieces:
#     def __init__(self):
#         self.pawn_1 = PiecePawn("pawn", (1, 2), 1, "white")
#         self.pawn_2 = PiecePawn("pawn", (2, 2), 1, "white")
#         self.pawn_3 = PiecePawn("pawn", (3, 2), 1, "white")
#         self.pawn_4 = PiecePawn("pawn", (4, 2), 1, "white")
#         self.pawn_5 = PiecePawn("pawn", (5, 2), 1, "white")
#         self.pawn_6 = PiecePawn("pawn", (6, 2), 1, "white")
#         self.pawn_7 = PiecePawn("pawn", (7, 2), 1, "white")
#         self.pawn_8 = PiecePawn("pawn", (8, 2), 1, "white")
#         self.rook_1 = PieceRook("rook", (1, 1), 5, "white")
#         self.rook_2 = PieceRook("rook", (8, 1), 5, "white")
#         self.bishop_1 = PieceBishop("bishop", (3, 1), 3, "white")
#         self.bishop_2 = PieceBishop("bishop", (6, 1), 3, "white")
#         self.knight_1 = PieceKnight("knight", (2, 1), 3, "white")
#         self.knight_2 = PieceKnight("knight", (7, 1), 3, "white")
#         self.queen_1 = PieceQueen("queen", (5, 1), 9, "white")
#         self.king_1 = PieceKing("king", (4, 1), 0, "white")
#
#         self.whites = {
#             "pawn_1": self.pawn_1,
#             "pawn_2": self.pawn_2,
#             "pawn_3": self.pawn_3,
#             "pawn_4": self.pawn_4,
#             "pawn_5": self.pawn_5,
#             "pawn_6": self.pawn_6,
#             "pawn_7": self.pawn_7,
#             "pawn_8": self.pawn_8,
#             "rook_1": self.rook_1,
#             "rook_2": self.rook_2,
#             "bishop_1": self.bishop_1,
#             "bishop_2": self.bishop_2,
#             "knight_1": self.knight_1,
#             "knight_2": self.knight_2,
#             "queen": self.queen_1,
#             "king": self.king_1
#         }
#
#         self.pawn_9 = PiecePawn("pawn", (1, 7), 1, "black")
#         self.pawn_10 = PiecePawn("pawn", (2, 7), 1, "black")
#         self.pawn_11 = PiecePawn("pawn", (3, 7), 1, "black")
#         self.pawn_12 = PiecePawn("pawn", (4, 7), 1, "black")
#         self.pawn_13 = PiecePawn("pawn", (5, 7), 1, "black")
#         self.pawn_14 = PiecePawn("pawn", (6, 7), 1, "black")
#         self.pawn_15 = PiecePawn("pawn", (7, 7), 1, "black")
#         self.pawn_16 = PiecePawn("pawn", (8, 7), 1, "black")
#         self.rook_3 = PieceRook("rook", (1, 8), 5, "black")
#         self.rook_4 = PieceRook("rook", (8, 8), 5, "black")
#         self.bishop_3 = PieceBishop("bishop", (3, 8), 3, "black")
#         self.bishop_4 = PieceBishop("bishop", (6, 8), 3, "black")
#         self.knight_3 = PieceKnight("knight", (2, 8), 3, "black")
#         self.knight_4 = PieceKnight("knight", (7, 8), 3, "black")
#         self.queen_2 = PieceQueen("queen", (4, 8), 9, "black")
#         self.king_2 = PieceKing("king", (5, 8), 0, "black")
#
#         self.white_pieces = {
#             "pawn_1": self.pawn_1,
#             "pawn_2": self.pawn_2,
#             "pawn_3": self.pawn_3,
#             "pawn_4": self.pawn_4,
#             "pawn_5": self.pawn_5,
#             "pawn_6": self.pawn_6,
#             "pawn_7": self.pawn_7,
#             "pawn_8": self.pawn_8,
#             "rook_1": self.rook_1,
#             "rook_2": self.rook_2,
#             "bishop_1": self.bishop_1,
#             "bishop_2": self.bishop_2,
#             "knight_1": self.knight_1,
#             "knight_2": self.knight_2,
#             "queen": self.queen_1,
#             "king": self.king_1
#         }
#
#         self.black_pieces = {
#             "pawn_1": self.pawn_9,
#             "pawn_2": self.pawn_10,
#             "pawn_3": self.pawn_11,
#             "pawn_4": self.pawn_12,
#             "pawn_5": self.pawn_13,
#             "pawn_6": self.pawn_14,
#             "pawn_7": self.pawn_15,
#             "pawn_8": self.pawn_16,
#             "rook_1": self.rook_3,
#             "rook_2": self.rook_4,
#             "bishop_1": self.bishop_3,
#             "bishop_2": self.bishop_4,
#             "knight_1": self.knight_3,
#             "knight_2": self.knight_4,
#             "queen": self.queen_2,
#             "king": self.king_2
#         }


class GameInitializer:

    def get_board_state(self):
        whites_state = {}
        blacks_state = {}
        for name, piece in self.white_pieces.items():
            whites_state[name] = piece

        for name, piece in self.black_pieces.items():
            blacks_state[name] = piece

        return {"board_state": {"white": whites_state, "black": blacks_state}}

    def init_moves(self):
        black_pieces_state = self.get_board_state().get('board_state').get('black')
        white_pieces_state = self.get_board_state().get('board_state').get('white')

        black_occupied_positions = [piece.position for piece in black_pieces_state.values()]
        white_occupied_positions = [piece.position for piece in white_pieces_state.values()]

        for name, piece in black_pieces_state.items():
            piece.move_validator(white_occupied_positions, black_occupied_positions)

        for name, piece in white_pieces_state.items():
            piece.move_validator(white_occupied_positions, black_occupied_positions)


class GameLoader:
    def __init__(self, room_id):
        super().__init__()
        self.room_id = room_id
        self.game = ChessGame.objects.filter(room_id=self.room_id).first()
        self.white_pieces = {}
        self.black_pieces = {}
        # self.white_pieces_model = None
        # self.black_pieces_model = None

    def create_board(self):
        class_mapping = {
            "pawn": PiecePawn,
            "rook": PieceRook,
            "bishop": PieceBishop,
            "knight": PieceKnight,
            "queen": PieceQueen,
            "king": PieceKing

        }

        white_pieces_initial_data = {
            "pawn_1": {"type": "pawn", "position": (1, 2), "color": "white"},
            "pawn_2": {"type": "pawn", "position": (2, 2), "color": "white"},
            "pawn_3": {"type": "pawn", "position": (3, 2), "color": "white"},
            "pawn_4": {"type": "pawn", "position": (4, 2), "color": "white"},
            "pawn_5": {"type": "pawn", "position": (5, 2), "color": "white"},
            "pawn_6": {"type": "pawn", "position": (6, 2), "color": "white"},
            "pawn_7": {"type": "pawn", "position": (7, 2), "color": "white"},
            "pawn_8": {"type": "pawn", "position": (8, 2), "color": "white"},
            "rook_1": {"type": "rook", "position": (1, 1), "color": "white"},
            "rook_2": {"type": "rook", "position": (8, 1), "color": "white"},
            "bishop_1": {"type": "bishop", "position": (3, 1), "color": "white"},
            "bishop_2": {"type": "bishop", "position": (6, 1), "color": "white"},
            "knight_1": {"type": "knight", "position": (2, 1), "color": "white"},
            "knight_2": {"type": "knight", "position": (7, 1), "color": "white"},
            "queen": {"type": "queen", "position": (5, 1), "color": "white"},
            "king": {"type": "king", "position": (4, 1), "color": "white"},
        }

        black_pieces_initial_data = {
            "pawn_1": {"type": "pawn", "position": (1, 7), "color": "black"},
            "pawn_2": {"type": "pawn", "position": (2, 7), "color": "black"},
            "pawn_3": {"type": "pawn", "position": (3, 7), "color": "black"},
            "pawn_4": {"type": "pawn", "position": (4, 7), "color": "black"},
            "pawn_5": {"type": "pawn", "position": (5, 7), "color": "black"},
            "pawn_6": {"type": "pawn", "position": (6, 7), "color": "black"},
            "pawn_7": {"type": "pawn", "position": (7, 7), "color": "black"},
            "pawn_8": {"type": "pawn", "position": (8, 7), "color": "black"},
            "rook_1": {"type": "rook", "position": (1, 8), "color": "black"},
            "rook_2": {"type": "rook", "position": (8, 8), "color": "black"},
            "bishop_1": {"type": "bishop", "position": (3, 8), "color": "black"},
            "bishop_2": {"type": "bishop", "position": (6, 8), "color": "black"},
            "knight_1": {"type": "knight", "position": (2, 8), "color": "black"},
            "knight_2": {"type": "knight", "position": (7, 8), "color": "black"},
            "queen": {"type": "queen", "position": (4, 8), "color": "black"},
            "king": {"type": "king", "position": (5, 8), "color": "black"},
        }

        for piece, data in white_pieces_initial_data:
            piece_type = data["type"]
            piece_position = data["position"]
            piece_color = data["color"]
            piece_class = class_mapping[piece_type]
            self.white_pieces[piece] = piece_class(piece_type, piece_position, piece_color)

        # for piece, data in self.black_pieces_data.items():
        #     piece_class = class_mapping[data["type"]]
        #     self.black_pieces[piece] = piece_class(data["type"], data["position"], data["weight"], data["color"])

        print(self.white_pieces)

    # def read_pieces_info(self):
    #     self.white_pieces_model = WhitePieces.objects.filter(game_id=self.game.pk).first()
    #     self.black_pieces_model = BlackPieces.objects.filter(game_id=self.game.pk).first()
    #
    # def init_pieces(self):

    #
    #     self.white_pieces = {}
    #     self.black_pieces = {}
    #     for piece, data in self.white_pieces_data.items():
    #         piece_class = class_mapping[data["type"]]
    #         self.white_pieces[piece] = piece_class(data["type"], data["position"], data["weight"], data["color"])
    #
    #     for piece, data in self.black_pieces_data.items():
    #         piece_class = class_mapping[data["type"]]
    #         self.black_pieces[piece] = piece_class(data["type"], data["position"], data["weight"], data["color"])
    #
    # def validate_moves(self):
    #     self.init_pieces()
    #     self.init_moves()
    #     print(self.white_pieces["pawn_2"].possible_moves)