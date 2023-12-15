import copy

from .serializers import BlackBoardSerializer, WhiteBoardSerializer
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


def create_board_in_db(white_board, black_board):
    """ Creates tables for new game """
    white_serializer = WhiteBoardSerializer(data=white_board)
    black_serializer = BlackBoardSerializer(data=black_board)

    white_serializer.is_valid(raise_exception=True)
    black_serializer.is_valid(raise_exception=True)

    white_serializer.save()
    black_serializer.save()


def edit_board_in_db(white_board, black_board, game_id, socket_data=None):
    """ Edits pieces info in already existing table """
    white_board_instance = WhitePieces.objects.get(game_id=game_id)
    black_board_instance = BlackPieces.objects.get(game_id=game_id)

    existing_white_keys = [field.name for field in WhitePieces._meta.get_fields()]
    existing_black_keys = [field.name for field in BlackPieces._meta.get_fields()]

    keys_to_skip = ['game_id', 'castled', 'rook_1_moved', 'rook_2_moved', 'king_moved']
    for key in existing_white_keys:
        if key not in white_board and not key == 'id' and key not in keys_to_skip:
            setattr(white_board_instance, key, None)

    for key in existing_black_keys:
        if key not in black_board and not key == 'id' and key not in keys_to_skip:
            setattr(black_board_instance, key, None)

    for key, value in white_board.items():
        if not key == 'game_id':
            setattr(white_board_instance, key, value)

    for key, value in black_board.items():
        if not key == 'game_id':
            setattr(black_board_instance, key, value)

    if socket_data:
        data_type = socket_data['data_type']
        piece = socket_data['piece']
        color = socket_data['color']

        if data_type == 'move' and piece == 'rook_1' and color == 'white':
            setattr(white_board_instance, 'rook_1_moved', True)
        elif data_type == 'move' and piece == 'rook_2' and color == 'white':
            setattr(white_board_instance, 'rook_2_moved', True)
        elif data_type == 'move' and piece == 'rook_1' and color == 'black':
            setattr(black_board_instance, 'rook_1_moved', True)
        elif data_type == 'move' and piece == 'rook_2' and color == 'black':
            setattr(black_board_instance, 'rook_2_moved', True)
        elif data_type == 'move' and piece == 'king' and color == 'white':
            setattr(white_board_instance, 'king_moved', True)
        elif data_type == 'move' and piece == 'king' and color == 'black':
            setattr(black_board_instance, 'king_moved', True)

    white_board_instance.save()
    black_board_instance.save()


def is_move_illegal(temporary_game_state, name, piece, move):
    """ Checks if move on an empty space is illegal """
    illegal_move = False

    if piece.color == 'white':
        temp_piece = temporary_game_state.white_pieces[name]
    elif piece.color == 'black':
        temp_piece = temporary_game_state.black_pieces[name]

    base_position = temp_piece.position
    temp_piece.position = move
    temporary_game_state.init_moves()
    temporary_game_state.check_king_safety()

    if ((piece.color == 'white' and temporary_game_state.white_check) or
            (piece.color == 'black' and temporary_game_state.black_check)):
        illegal_move = True

    temp_piece.position = base_position

    return illegal_move


def is_capture_illegal(temporary_game_state, name, piece, move):
    """ Checks if capturing is illegal """
    illegal_capture = False
    temporary_game_state.init_moves()

    if piece.color == 'white':
        temp_piece = temporary_game_state.white_pieces[name]
    elif piece.color == 'black':
        temp_piece = temporary_game_state.black_pieces[name]

    piece_to_capture = temp_piece.capture_piece(move)
    piece_name = remove_piece(piece_to_capture, temporary_game_state)
    temp_piece.position = move

    if not piece_name == 'king':
        temporary_game_state.init_moves()
        temporary_game_state.check_king_safety()
    else:
        illegal_capture = True

    if ((piece.color == 'white' and temporary_game_state.white_check) or
            (piece.color == 'black' and temporary_game_state.black_check)):
        illegal_capture = True

    return illegal_capture


def check_move(temporary_game_state, name, piece):
    """ Checks if move is illegal """

    for move in unpack_positions(piece.possible_moves):
        if is_move_illegal(temporary_game_state, name, piece, move):
            piece.illegal_moves.append(move)
        else:
            piece.valid_moves.append(move)

    capturing_moves_copy = copy.deepcopy(piece.capturing_moves)
    for move in piece.capturing_moves:
        capture_game_state = copy.deepcopy(temporary_game_state)

        if is_capture_illegal(capture_game_state, name, piece, move):
            capturing_moves_copy.remove(move)

    piece.capturing_moves = capturing_moves_copy


def are_castle_fields_free(required_fields, taken_fields):
    for field in required_fields:
        if field in taken_fields:
            return False
    return True


def are_castle_fields_not_attacked(required_fields, enemy_pieces_moves):
    for field in required_fields:
        if field in enemy_pieces_moves:
            return False
    return True


def is_castle_legal(game, taken_fields, white_moves, black_moves):
    game.white_short_castle_legal = False
    game.black_short_castle_legal = False
    game.white_long_castle_legal = False
    game.black_long_castle_legal = False

    if not game.white_check and not game.white_king_moved:
        # white short castle
        required_free_fields = [(6, 1), (7, 1)]
        if (not game.white_rook_2_moved and are_castle_fields_free(required_free_fields, taken_fields) and
                are_castle_fields_not_attacked(required_free_fields, black_moves)):
            game.white_short_castle_legal = True
        # white long castle
        required_free_fields = [(2, 1), (3, 1), (4, 1)]
        if (not game.white_rook_1_moved and are_castle_fields_free(required_free_fields, taken_fields) and
                are_castle_fields_not_attacked(required_free_fields, black_moves)):
            game.white_long_castle_legal = True
    if not game.black_check and not game.black_king_moved:
        # black short castle
        required_free_fields = [(6, 8), (7, 8)]
        if (not game.black_rook_2_moved and are_castle_fields_free(required_free_fields, taken_fields) and
                are_castle_fields_not_attacked(required_free_fields, white_moves)):
            game.black_short_castle_legal = True
        # black long castle
        required_free_fields = [(2, 8), (3, 8), (4, 8)]
        if (not game.black_rook_1_moved and are_castle_fields_free(required_free_fields, taken_fields) and
                are_castle_fields_not_attacked(required_free_fields, white_moves)):
            game.black_long_castle_legal = True


def get_valid_moves(game):
    """ Gets valid and illegal moves for each piece on board """
    temporary_game_state = copy.deepcopy(game)
    temporary_game_state.init_moves()
    amount_of_possible_moves = 0
    taken_fields = []
    white_possible_moves = []
    black_possible_moves = []

    for name, piece in game.white_pieces.items():
        check_move(temporary_game_state, name, piece)
        amount_of_possible_moves += (len(piece.valid_moves) + len(piece.capturing_moves))
        taken_fields.append(piece.position)
        for move in unpack_positions(piece.possible_moves):
            white_possible_moves.append(move)

    if amount_of_possible_moves == 0:
        game.white_checkmate = True

    amount_of_possible_moves = 0

    for name, piece in game.black_pieces.items():
        check_move(temporary_game_state, name, piece)
        amount_of_possible_moves += (len(piece.valid_moves) + len(piece.capturing_moves))
        taken_fields.append(piece.position)
        for move in unpack_positions(piece.possible_moves):
            black_possible_moves.append(move)

    if amount_of_possible_moves == 0:
        game.black_checkmate = True

    is_castle_legal(game, taken_fields, white_possible_moves, black_possible_moves)


def validate_move_request(move_data, game, room_id):
    """ Checks whether the move request is valid """
    if move_data['color'] == 'white':
        piece = game.white_pieces[move_data['piece']]
    elif move_data['color'] == 'black':
        piece = game.black_pieces[move_data['piece']]

    new_position = position_to_tuple(move_data['new_position'])
    possible_positions = unpack_positions(piece.possible_moves)
    possible_captures = piece.capturing_moves

    if new_position not in possible_positions + possible_captures:
        error_message = "Incorrect request"
        error = {'message': error_message}
        return error

    if new_position in possible_captures:
        piece_to_capture = piece.capture_piece(new_position)
        _ = remove_piece(piece_to_capture, game)

    piece.position = new_position
    game_instance = ChessGame.objects.get(room_id=room_id)

    if game_instance.current_player == 'white':
        game_instance.current_player = 'black'
    else:
        game_instance.current_player = 'white'
    game_instance.save()

    return game


def read_model_fields(model):
    """ Saves model data as dict """
    pieces_data = {}
    castle_data = {}
    for field in model._meta.get_fields():
        if field.concrete and not field.is_relation and not field.name == 'id':
            field_name = field.name
            field_value = getattr(model, field_name)
            deserialized_data = {}

            if field_value and not isinstance(field_value, bool):
                for key, value in field_value.items():
                    if isinstance(value, list):
                        data = deserialize_lists(value)
                    else:
                        data = value
                    deserialized_data[key] = data

                pieces_data[field_name] = deserialized_data

            if isinstance(field_value, bool):
                castle_data[field_name] = field_value

    return pieces_data, castle_data


def remove_piece(piece_to_remove, game):
    """ Removes captures piece """
    new_pieces_set = {}

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
