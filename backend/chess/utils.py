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
