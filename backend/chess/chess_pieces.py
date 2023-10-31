from abc import ABC, abstractmethod


class Piece(ABC):
    def __init__(self, position, color):
        self.piece_type = ''
        self.position = position
        self.x_position = position[0]
        self.y_position = position[1]
        self.init_position = position
        self.color = color
        self.possible_moves = []
        self.capturing_moves = []

    def __repr__(self):
        return f'{self.color} {self.piece_type} at {self.position}'

    @abstractmethod
    def movement(self):
        """Returns list of default moves"""
        pass

    def init_from_json(self, data):
        print(data)

    def move_validator(self, white_occupied_positions, black_occupied_positions):
        """Validates possible moves"""
        self.possible_moves = []
        self.boundaries_validator()
        if self.color == 'white':
            self.pieces_blocking(white_occupied_positions, black_occupied_positions)
        elif self.color == 'black':
            self.pieces_blocking(black_occupied_positions, white_occupied_positions)

    def boundaries_validator(self):
        for moves in self.movement():
            move_set = []
            for move in moves:
                if (0 < move[0] < 9) and (0 < move[1] < 9):
                    move_set.append(move)
            if len(move_set) > 0:
                self.possible_moves.append(move_set)

    def pieces_blocking(self, friendly_occupied_positions, enemy_occupied_positions):
        non_blocked_move_sets = []
        capturing_moves = []

        for move_set in self.possible_moves:
            non_blocked_moves = []
            for move in move_set:
                if move in friendly_occupied_positions:
                    break
                if move in enemy_occupied_positions:
                    capturing_moves.append(move)
                    break
                non_blocked_moves.append(move)

            if len(non_blocked_moves) > 0:
                non_blocked_move_sets.append(non_blocked_moves)

        self.capturing_moves = capturing_moves
        self.possible_moves = non_blocked_move_sets


class RookMoves(Piece):
    def movement(self):
        possible_moves = []
        x_moves_left = [(i, self.y_position) for i in reversed(range(1, self.x_position))]
        x_moves_right = [(i, self.y_position) for i in range(self.x_position + 1, 9)]
        y_moves_down = [(self.x_position, i) for i in reversed(range(1, self.y_position))]
        y_moves_top = [(self.x_position, i) for i in range(self.y_position + 1, 9)]

        possible_moves.extend([x_moves_left, x_moves_right, y_moves_down, y_moves_top])
        return possible_moves


class BishopMoves(Piece):
    def movement(self):
        possible_moves = []
        move_left_up = [(self.x_position - i, self.y_position + i) for i in range(1, 9)]
        move_left_down = [(self.x_position - i, self.y_position - i) for i in range(1, 9)]
        move_right_up = [(self.x_position + i, self.y_position + i) for i in range(1, 9)]
        move_right_down = [(self.x_position + i, self.y_position - i) for i in range(1, 9)]

        possible_moves.extend([move_left_up, move_left_down, move_right_down, move_right_up])
        return possible_moves


class PiecePawn(Piece):
    def __init__(self, position, color):
        super().__init__(position, color)
        self.weight = 1
        self.piece_type = "pawn"

    def movement(self):
        if self.color == "white":
            move_dir = 1
        else:
            move_dir = -1

        possible_moves = [[(self.x_position, self.y_position + 1 * move_dir)]]
        if self.at_base_position():
            possible_moves.extend([[(self.x_position, self.y_position + 2 * move_dir)]])

        return possible_moves

    def at_base_position(self):
        if self.position == self.init_position:
            return True
        return False


class PieceRook(RookMoves):
    def __init__(self, position, color):
        super().__init__(position, color)
        self.weight = 5
        self.piece_type = "rook"


class PieceBishop(BishopMoves):
    def __init__(self, position, color):
        super().__init__(position, color)
        self.weight = 3
        self.piece_type = "bishop"


class PieceKnight(Piece):
    def __init__(self, position, color):
        super().__init__(position, color)
        self.weight = 3
        self.piece_type = "knight"

    def movement(self):
        possible_moves = [
            [(self.x_position - 2, self.y_position + 1)], [(self.x_position - 2, self.y_position - 1)],
            [(self.x_position + 2, self.y_position + 1)], [(self.x_position + 2, self.y_position - 1)],
            [(self.x_position + 1, self.y_position - 2)], [(self.x_position - 1, self.y_position - 2)],
            [(self.x_position + 1, self.y_position + 2)], [(self.x_position - 1, self.y_position + 2)]
        ]
        return possible_moves


class PieceQueen(Piece):
    def __init__(self, position, color):
        super().__init__(position, color)
        self.weight = 9
        self.piece_type = "queen"

    def movement(self):
        possible_moves = []
        rook_moves = RookMoves.movement(self)
        bishop_moves = BishopMoves.movement(self)
        possible_moves.extend(rook_moves + bishop_moves)
        return possible_moves


class PieceKing(Piece):
    def __init__(self, position, color):
        super().__init__(position, color)
        self.weight = 0
        self.piece_type = "king"

    def movement(self):
        possible_moves = [[(self.x_position - 1, self.y_position + 1)], [(self.x_position, self.y_position + 1)],
                          [(self.x_position + 1, self.y_position + 1)], [(self.x_position + 1, self.y_position)],
                          [(self.x_position + 1, self.y_position - 1)], [(self.x_position, self.y_position - 1)],
                          [(self.x_position - 1, self.y_position - 1)], [(self.x_position - 1, self.y_position)]]
        return possible_moves
