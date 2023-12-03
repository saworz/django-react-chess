from abc import ABC, abstractmethod
from .utils import unpack_positions

class Piece(ABC):
    def __init__(self, base_position, position, color):
        self.piece_type = ''
        self.position = position
        self.x_position = position[0]
        self.y_position = position[1]
        self.base_position = base_position
        self.color = color

        self.possible_moves = []
        self.capturing_moves = []
        self.pieces_to_capture = []
        self.illegal_moves = []

        self.friendly_pieces = []
        self.friendly_positions = []
        self.enemy_pieces = []
        self.enemy_positions = []

    def __repr__(self):
        return f'{self.color} {self.piece_type} at {self.position}'

    @abstractmethod
    def movement(self):
        """ Returns list of default moves """
        pass

    def reload_position(self):
        """ Reloads piece's position after moving """
        self.x_position = self.position[0]
        self.y_position = self.position[1]

    def set_friendly_board(self, friendly_board):
        self.friendly_pieces = [piece for piece in friendly_board.values()]
        self.friendly_positions = [piece.position for piece in self.friendly_pieces]

    def set_enemy_board(self, enemy_board):
        self.enemy_pieces = [piece for piece in enemy_board.values()]
        self.enemy_positions = [piece.position for piece in self.enemy_pieces]

    def move_validator(self, white_board, black_board):
        """ Validates possible moves """
        self.possible_moves = []
        self.boundaries_validator()
        if self.color == 'white':
            self.set_friendly_board(white_board)
            self.set_enemy_board(black_board)
            self.pieces_blocking()
        elif self.color == 'black':
            self.set_friendly_board(black_board)
            self.set_enemy_board(white_board)
            self.pieces_blocking()

    def king_defensive_moves(self, white_board, black_board):
        """ Validates possible moves when king is checked """

        pass

    def boundaries_validator(self):
        """ Validates if possible move is within the board """
        for moves in self.movement():
            move_set = []
            for move in moves:
                if (0 < move[0] < 9) and (0 < move[1] < 9):
                    move_set.append(move)
            if len(move_set) > 0:
                self.possible_moves.append(move_set)

    def capture_piece(self, position):
        """ Returns piece object that's about to be captured """
        for move, piece in zip(self.capturing_moves, self.pieces_to_capture):
            if move == position:
                return piece

    def pawn_capture_logic(self, enemy_pieces):
        """ Pawns have different type of capturing - they attack diagonal """
        direction = 1 if self.color == 'white' else -1

        for enemy_piece in enemy_pieces:
            diag_left_pos = self.position[0] - 1, self.position[1] + direction
            diag_right_pos = self.position[0] + 1, self.position[1] + direction

            if diag_left_pos == enemy_piece.position:
                self.capturing_moves.append(diag_left_pos)
                self.pieces_to_capture.append(enemy_piece)
            if diag_right_pos == enemy_piece.position:
                self.capturing_moves.append(diag_right_pos)
                self.pieces_to_capture.append(enemy_piece)

    def basic_capture_logic(self, position, enemy_pieces):
        """ Capture logic for all pieces but pawns """
        for enemy_piece in enemy_pieces:
            if position == enemy_piece.position:
                self.capturing_moves.append(position)
                self.pieces_to_capture.append(enemy_piece)

    def pieces_blocking(self):
        """ Checks what which fields are blocked by friendly or enemy pawns
         If path is blocked by friendly piece, it just can't go any further.
         If path is blocked by enemy piece, it can be captured (not for pawns)"""
        non_blocked_move_sets = []

        self.capturing_moves = []
        self.pieces_to_capture = []

        for move_set in self.possible_moves:
            non_blocked_moves = []
            for move in move_set:
                if move in self.friendly_positions:
                    break
                if move in self.enemy_positions:
                    if self.piece_type != 'pawn':
                        self.basic_capture_logic(move, self.enemy_pieces)
                    break
                non_blocked_moves.append(move)

            if len(non_blocked_moves) > 0:
                non_blocked_move_sets.append(non_blocked_moves)

        if self.piece_type == 'pawn':
            self.pawn_capture_logic(self.enemy_pieces)
        self.possible_moves = non_blocked_move_sets


class RookMoves(Piece):
    def movement(self):
        """ Move scheme
         Used also for queen"""
        possible_moves = []
        x_moves_left = [(i, self.y_position) for i in reversed(range(1, self.x_position))]
        x_moves_right = [(i, self.y_position) for i in range(self.x_position + 1, 9)]
        y_moves_down = [(self.x_position, i) for i in reversed(range(1, self.y_position))]
        y_moves_top = [(self.x_position, i) for i in range(self.y_position + 1, 9)]

        possible_moves.extend([x_moves_left, x_moves_right, y_moves_down, y_moves_top])
        return possible_moves


class BishopMoves(Piece):
    def movement(self):
        """ Move scheme
         Used also for queen"""
        possible_moves = []
        move_left_up = [(self.x_position - i, self.y_position + i) for i in range(1, 9)]
        move_left_down = [(self.x_position - i, self.y_position - i) for i in range(1, 9)]
        move_right_up = [(self.x_position + i, self.y_position + i) for i in range(1, 9)]
        move_right_down = [(self.x_position + i, self.y_position - i) for i in range(1, 9)]

        possible_moves.extend([move_left_up, move_left_down, move_right_down, move_right_up])
        return possible_moves


class PiecePawn(Piece):
    def __init__(self, base_position, position, color):
        super().__init__(base_position, position, color)
        self.weight = 1
        self.piece_type = "pawn"

    def movement(self):
        """ Move scheme """
        move_dir = 1 if self.color == 'white' else -1
        possible_moves = [[(self.x_position, self.y_position + 1 * move_dir)]]

        if self.base_position == self.position:
            possible_moves[0].extend([(self.x_position, self.y_position + 2 * move_dir)])

        return possible_moves


class PieceRook(RookMoves):
    def __init__(self, base_position, position, color):
        super().__init__(base_position, position, color)
        self.weight = 5
        self.piece_type = "rook"


class PieceBishop(BishopMoves):
    def __init__(self, base_position,  position, color):
        super().__init__(base_position, position, color)
        self.weight = 3
        self.piece_type = "bishop"


class PieceKnight(Piece):
    def __init__(self, base_position,  position, color):
        super().__init__(base_position, position, color)
        self.weight = 3
        self.piece_type = "knight"

    def movement(self):
        """ Move scheme """
        possible_moves = [
            [(self.x_position - 2, self.y_position + 1)], [(self.x_position - 2, self.y_position - 1)],
            [(self.x_position + 2, self.y_position + 1)], [(self.x_position + 2, self.y_position - 1)],
            [(self.x_position + 1, self.y_position - 2)], [(self.x_position - 1, self.y_position - 2)],
            [(self.x_position + 1, self.y_position + 2)], [(self.x_position - 1, self.y_position + 2)]
        ]
        return possible_moves


class PieceQueen(Piece):
    def __init__(self,base_position,  position, color):
        super().__init__(base_position, position, color)
        self.weight = 9
        self.piece_type = "queen"

    def movement(self):
        """ Move scheme """
        possible_moves = []
        rook_moves = RookMoves.movement(self)
        bishop_moves = BishopMoves.movement(self)
        possible_moves.extend(rook_moves + bishop_moves)
        return possible_moves


class PieceKing(Piece):
    def __init__(self,base_position,  position, color):
        super().__init__(base_position, position, color)
        self.weight = 0
        self.piece_type = "king"

    def movement(self):
        """ Move scheme """
        possible_moves = [[(self.x_position - 1, self.y_position + 1)], [(self.x_position, self.y_position + 1)],
                          [(self.x_position + 1, self.y_position + 1)], [(self.x_position + 1, self.y_position)],
                          [(self.x_position + 1, self.y_position - 1)], [(self.x_position, self.y_position - 1)],
                          [(self.x_position - 1, self.y_position - 1)], [(self.x_position - 1, self.y_position)]]
        return possible_moves
