from .chess_pieces import PiecePawn, PieceRook, PieceBishop, PieceKnight, PieceKing, PieceQueen


class Game:
    def __init__(self):
        self.pawn_1 = PiecePawn("pawn_1", (1, 2), 1, 'white')
        self.pawn_2 = PiecePawn("pawn_2", (2, 2), 1, 'white')
        self.pawn_3 = PiecePawn("pawn_3", (3, 2), 1, 'white')
        self.pawn_4 = PiecePawn("pawn_4", (4, 2), 1, 'white')
        self.pawn_5 = PiecePawn("pawn_5", (5, 2), 1, 'white')
        self.pawn_6 = PiecePawn("pawn_6", (6, 2), 1, 'white')
        self.pawn_7 = PiecePawn("pawn_7", (7, 2), 1, 'white')
        self.pawn_8 = PiecePawn("pawn_8", (8, 2), 1, 'white')

        self.whites = {
            "pawn_1": self.pawn_1,
            "pawn_2": self.pawn_2,
            "pawn_3": self.pawn_3,
            "pawn_4": self.pawn_4,
            "pawn_5": self.pawn_5,
            "pawn_6": self.pawn_6,
            "pawn_7": self.pawn_7,
            "pawn_8": self.pawn_8,
        }

    def get_board_state(self):
        board_state = {}
        for value, key in self.whites.items():
            board_state[value] = key.position

        return board_state


def init_board():
    game = Game()
    print(game.get_board_state())
