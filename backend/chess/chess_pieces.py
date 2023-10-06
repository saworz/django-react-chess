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
        self.validated_moves = []

    def __repr__(self):
        return f'{self.color} {self.name} at {self.position}'

    @abstractmethod
    def movement(self):
        """Returns list of default moves"""
        pass

    def move_validator(self, friendly_occupied_positions):
        """Validates move according to board boundaries"""
        self.validated_moves = []
        self.boundaries_validator()
        self.friendly_blocking(friendly_occupied_positions)
        # self.friendly_pieces_validator(friendly_occupied_positions)
        # return self.validated_moves
        print(self)
        print("Possible moves:")
        print(self.validated_moves)

    def boundaries_validator(self):
        for moves in self.movement():
            move_set = []
            for move in moves:
                if (0 < move[0] < 9) and (0 < move[1] < 9):
                    move_set.append(move)
            if len(move_set) > 0:
                self.validated_moves.append(move_set)

    def friendly_blocking(self, friendly_occupied_positions):
        non_blocked_move_sets = []

        for move_set in self.validated_moves:
            non_blocked_moves = []
            for move in move_set:
                if move in friendly_occupied_positions:
                    break
                non_blocked_moves.append(move)
            if len(non_blocked_moves) > 0:
                non_blocked_move_sets.append(non_blocked_moves)

        self.validated_moves = non_blocked_move_sets

    # def friendly_pieces_validator(self, friendly_occupied_positions):
    #     empty_positions = []
    #     for move in self.validated_moves:
    #         if move not in friendly_occupied_positions:
    #             empty_positions.append(move)
    #     print(self)
    #     print(empty_positions)
    #     self.validated_moves = empty_positions


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
