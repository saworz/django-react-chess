import copy


from .models import ChessGame, WhitePieces, BlackPieces


def deserialize_lists(lst):
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


def remove_piece(piece_to_remove, game):
    """ Removes captures piece """
    new_pieces_set = {}

    if not piece_to_remove:
        temp_game = copy.deepcopy(game)
        if game.white_pawn_en_passant_field:
            piece_to_remove = copy.deepcopy(game.white_pieces['pawn_1'])
            piece_to_remove.position = game.white_pawn_en_passant_field
            temp_game.white_pieces['pawn_passant'] = piece_to_remove

        elif game.black_pawn_en_passant_field:
            piece_to_remove = copy.deepcopy(game.black_pieces['pawn_1'])
            piece_to_remove.position = game.black_pawn_en_passant_field
            temp_game.black_pieces['pawn_passant'] = piece_to_remove

        return 'pawn_passant'

    if piece_to_remove.color == 'black':
        for key, value in game.black_pieces.items():
            if value.position == piece_to_remove.position:
                piece_name = key
            else:
                new_pieces_set[key] = value
        game.black_pieces = new_pieces_set

    elif piece_to_remove.color == 'white':
        for key, value in game.white_pieces.items():
            if value.position == piece_to_remove.position:
                piece_name = key
            else:
                new_pieces_set[key] = value
        game.white_pieces = new_pieces_set

    print(game.white_pieces)
    return piece_name


def unpack_positions(moves):
    """ Unpacks nested lists """
    moves_list = []
    for sublist in moves:
        for move in sublist:
            moves_list.append(tuple(move))
    return moves_list


def position_to_tuple(position):
    """ Rewrites position (e.g. 45 to (4, 5)) """
    return int(position[0]), int(position[1])


def prepare_data(pieces):
    """ Gets only specified data from pieces instances """
    prepared_data = {}
    for key, piece in pieces:
        prepared_data[key] = {'piece_type': piece.piece_type, 'position': piece.position, 'color': piece.color,
                              'valid_moves': piece.valid_moves, 'capturing_moves': piece.capturing_moves,
                              'illegal_moves': piece.illegal_moves}

    return prepared_data
