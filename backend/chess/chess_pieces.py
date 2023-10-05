from abc import ABC, abstractmethod


class Piece(ABC):
    def __init__(self, name, position, weight, color):
        self.name = name
        self.position = position
        self.init_position = position
        self.weight = weight
        self.color = color

    @abstractmethod
    def movement(self):
        """Returns list of possible moves"""
        pass


class PiecePawn(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = []
        # if self.at_base_position():

    def at_base_position(self):
        if self.position == self.at_base_position:
            return True
        return False


class PieceRook(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = []


class PieceBishop(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = []


class PieceKnight(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = []


class PieceKing(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = []


class PieceQueen(Piece):
    def __init__(self, name, position, weight, color):
        super().__init__(name, position, weight, color)

    def movement(self):
        possible_moves = []

