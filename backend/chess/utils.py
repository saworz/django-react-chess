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


def edit_board_in_db(white_board, black_board, game_id, current_player):
    """ Edits pieces info in already existing table """
    white_board_instance = WhitePieces.objects.get(game_id=game_id)
    black_board_instance = BlackPieces.objects.get(game_id=game_id)

    existing_white_keys = [field.name for field in WhitePieces._meta.get_fields()]
    existing_black_keys = [field.name for field in BlackPieces._meta.get_fields()]

    for key in existing_white_keys:
        if key not in white_board and not key == 'id' and not key == 'game_id':
            setattr(white_board_instance, key, None)

    for key in existing_black_keys:
        if key not in black_board and not key == 'id' and not key == 'game_id':
            setattr(black_board_instance, key, None)

    for key, value in white_board.items():
        if not key == 'game_id':
            setattr(white_board_instance, key, value)

    for key, value in black_board.items():
        if not key == 'game_id':
            setattr(black_board_instance, key, value)

    white_board_instance.save()
    black_board_instance.save()


def is_move_illegal(game, move_data, new_position):
    temporary_game_state = copy.deepcopy(game)
    if move_data['color'] == 'white':
        temp_piece = temporary_game_state.white_pieces[move_data['piece']]
    elif move_data['color'] == 'black':
        temp_piece = temporary_game_state.black_pieces[move_data['piece']]

    temp_piece.position = new_position
    temporary_game_state.init_moves()
    temporary_game_state.check_king_safety()

    if ((move_data['color'] == 'white' and temporary_game_state.white_check) or
            (move_data['color'] == 'black' and temporary_game_state.black_check)):
        return True


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
        print("Incorrect request")
        return

    # if king is checked after setting new_position thne its illegal move
    if is_move_illegal(game, move_data, new_position):
        print('illegal move')

    if new_position in possible_captures:
        piece_to_capture = piece.capture_piece(new_position)
        remove_piece(piece_to_capture, game)

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
    read_data = {}
    for field in model._meta.get_fields():
        if field.concrete and not field.is_relation and not field.name == 'id':
            field_name = field.name
            field_value = getattr(model, field_name)
            deserialized_data = {}

            if field_value:
                for key, value in field_value.items():
                    if isinstance(value, list):
                        data = deserialize_lists(value)
                    else:
                        data = value
                    deserialized_data[key] = data

                read_data[field_name] = deserialized_data
    return read_data


def remove_piece(piece_to_remove, game):
    """ Removes captures piece """
    if piece_to_remove.color == 'black':
        new_pieces_set = {key: value for key, value in game.black_pieces.items() if value != piece_to_remove}
        game.black_pieces = new_pieces_set
    elif piece_to_remove.color == 'white':
        new_pieces_set = {key: value for key, value in game.white_pieces.items() if value != piece_to_remove}
        game.white_pieces = new_pieces_set


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
                              'possible_moves': piece.possible_moves, 'capturing_moves': piece.capturing_moves}

    return prepared_data
