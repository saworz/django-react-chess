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
        for move in self.movement():
            if (0 < move[0] < 9) and (0 < move[1] < 9):
                validated_moves.append(move)
        return validated_moves


class PiecePawn(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        if self.color == "white":
            move_dir = 1
        else:
            move_dir = -1

        possible_moves = [(self.x_position, self.y_position + 1 * move_dir)]
        if self.at_base_position():
            possible_moves.append((self.x_position, self.y_position + 2 * move_dir))
        return possible_moves

    def at_base_position(self):
        if self.position == self.init_position:
            return True
        return False


class PieceRook(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = []
        x_moves = [(i, self.y_position) for i in range(9)]
        y_moves = [(self.x_position, i) for i in range(9)]
        possible_moves.extend(x_moves + y_moves)
        return possible_moves


class PieceBishop(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = []
        return possible_moves


class PieceKnight(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = [
            (self.x_position - 2, self.y_position + 1), (self.x_position - 2, self.y_position - 1),
            (self.x_position + 2, self.y_position + 1), (self.x_position + 2, self.y_position - 1),
            (self.y_position - 2, self.x_position + 1), (self.y_position - 2, self.x_position - 1),
            (self.y_position + 2, self.x_position + 1), (self.y_position + 2, self.x_position - 1)
        ]

        return possible_moves


class PieceQueen(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = []
        return possible_moves


class PieceKing(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = []
        return possible_moves
