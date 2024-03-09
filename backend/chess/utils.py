from .chess_pieces import PiecePawn, PieceRook, PieceBishop, PieceKnight, PieceQueen, PieceKing

CLASS_MAPPING = {
    "pawn": PiecePawn,
    "rook": PieceRook,
    "bishop": PieceBishop,
    "knight": PieceKnight,
    "queen": PieceQueen,
    "king": PieceKing
}

NOTATION_MAPPING = {
    "pawn": "",
    "rook": "R",
    "bishop": "B",
    "knight": "N",
    "queen": "Q",
    "king": "K"
}


def get_unique_room_id(pk_1: str, pk_2: str) -> str:
    ids = sorted([pk_1, pk_2])
    return ''.join(list(map(str, ids)))


def deserialize_lists(lst: list) -> list:
    """ Deserializes lists """
    result = []
    if len(lst) == 2 and not isinstance(lst[0], list):
        return lst[0], lst[1]

    for item in lst:
        if isinstance(item[0], int):
            result.append([(item[0], item[1])])
        elif isinstance(item, list):
            result.append([tuple(subitem) for subitem in item])
    return result


def unpack_positions(moves: list) -> list:
    """ Unpacks nested lists """
    moves_list = []
    for sublist in moves:
        for move in sublist:
            moves_list.append(tuple(move))
    return moves_list


def position_to_tuple(position: str) -> tuple:
    """ Rewrites position (e.g. 45 to (4, 5)) """
    return int(position[0]), int(position[1])


def get_position_in_chess_notation(position: str) -> str:
    """ Rewrites position to valid notation"""
    return chr(ord('a') + int(position[0]) - 1) + position[1]


def prepare_data(pieces: dict) -> dict:
    """ Gets only specified data from pieces instances """
    prepared_data = {}
    for key, piece in pieces:
        prepared_data[key] = {'piece_type': piece.piece_type, 'position': piece.position, 'color': piece.color,
                              'valid_moves': piece.valid_moves, 'capturing_moves': piece.capturing_moves,
                              'illegal_moves': piece.illegal_moves}

    return prepared_data
