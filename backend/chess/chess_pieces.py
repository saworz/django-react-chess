from abc import ABC, abstractmethod


class Piece(ABC):
    def __init__(self, name, position, weight, color):
        self.name = name
        self.position = position
        self.x_position = position[0]
        self.y_position = position[1]
        self.init_position = position
        self.weight = weight
        self.color = color

    @abstractmethod
    def movement(self):
        """Returns list of default moves"""
        pass

    def move_validator(self):
        """Validates move according to board boundaries"""
        validated_moves = []
        for moves in self.movement():
            for move in moves:
                if (0 < move[0] < 9) and (0 < move[1] < 9):
                    validated_moves.append(move)
        return validated_moves


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
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

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
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)


class PieceBishop(BishopMoves):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)


class PieceKnight(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = [
            [(self.x_position - 2, self.y_position + 1)], [(self.x_position - 2, self.y_position - 1)],
            [(self.x_position + 2, self.y_position + 1)], [(self.x_position + 2, self.y_position - 1)],
            [(self.x_position + 1, self.y_position - 2)], [(self.x_position - 1, self.y_position - 2)],
            [(self.x_position + 1, self.y_position + 2)], [(self.x_position - 1, self.y_position + 2)]
        ]
        return possible_moves


class PieceQueen(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = []
        rook_moves = RookMoves.movement(self)
        bishop_moves = BishopMoves.movement(self)
        possible_moves.extend(rook_moves + bishop_moves)
        return possible_moves


class PieceKing(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = [[(self.x_position - 1, self.y_position + 1)], [(self.x_position, self.y_position + 1)],
                          [(self.x_position + 1, self.y_position + 1)], [(self.x_position + 1, self.y_position)],
                          [(self.x_position + 1, self.y_position - 1)], [(self.x_position, self.y_position - 1)],
                          [(self.x_position - 1, self.y_position - 1)], [(self.x_position - 1, self.y_position)]]
        return possible_moves
