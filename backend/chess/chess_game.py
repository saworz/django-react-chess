import copy
from .chess_logic import GameLoader
from .chess_pieces import PiecePawn
from .utils import position_to_tuple, unpack_positions, get_position_in_chess_notation


class GameHandler:
    """ Handles game events (moving, capturing, promoting etc.) and stores game data """

    def __init__(self, room_id, socket_data):
        self.room_id = room_id
        self.socket_data = socket_data
        self.ambiguous_move_identifier = ""
        self.did_capture_in_last_move = False
        self.pawn_last_position_column_notation = None
        self.game = None

    def initialize_board(self):
        """ Initializes positions for a new game """
        self.game = GameLoader(room_id=self.room_id, socket_data=self.socket_data)
        self.game.create_board()
        self.game.init_moves()

    def set_castle_data(self, white_castle_data, black_castle_data):
        """ Sets data for castling """
        self.game.white_rook_1_moved = white_castle_data['rook_1_moved']
        self.game.white_rook_2_moved = white_castle_data['rook_2_moved']
        self.game.white_king_moved = white_castle_data['king_moved']
        self.game.black_rook_1_moved = black_castle_data['rook_1_moved']
        self.game.black_rook_2_moved = black_castle_data['rook_2_moved']
        self.game.black_king_moved = black_castle_data['king_moved']
        self.game.white_castled = white_castle_data['castled']
        self.game.black_castled = black_castle_data['castled']

    def init_board_from_db(self, db_game_state):
        """ Gets list of possible_moves for each piece """
        self.game = GameLoader(room_id=self.room_id, socket_data=self.socket_data)
        self.game.create_pieces_objects(db_game_state['white_pieces'], db_game_state['black_pieces'])
        self.game.init_moves()

        white_castle_data = db_game_state['white_castle']
        black_castle_data = db_game_state['black_castle']
        self.set_castle_data(white_castle_data, black_castle_data)

        self.game.white_pawn_en_passant_field = db_game_state['white_en_passant_field']
        self.game.black_pawn_en_passant_field = db_game_state['black_en_passant_field']

    def check_en_passant_field(self, piece):
        """ Checks whether en_passant_field is legal """
        if piece.color == "white":
            for name, figure in self.game.black_pieces.items():
                black_en_pas = position_to_tuple(self.game.black_pawn_en_passant_field)
                real_position = (black_en_pas[0], black_en_pas[1] - 1)

                if figure.piece_type == "pawn" and figure.position == real_position:
                    piece_to_capture = figure

        elif piece.color == 'black':
            for name, figure in self.game.white_pieces.items():
                white_en_pas = position_to_tuple(self.game.white_pawn_en_passant_field)
                real_position = (white_en_pas[0], white_en_pas[1] + 1)

                if figure.piece_type == "pawn" and figure.position == real_position:
                    piece_to_capture = figure

        _ = self.remove_piece(piece_to_capture, self.game)

    def get_en_passant_field(self) -> list[tuple]:
        """ Gets field for possible en_passant move """
        en_passant_field = []

        if self.game.white_pawn_en_passant_field:
            en_passant_field.append(position_to_tuple(self.game.white_pawn_en_passant_field))
        elif self.game.black_pawn_en_passant_field:
            en_passant_field.append(position_to_tuple(self.game.black_pawn_en_passant_field))

        return en_passant_field

    def set_en_passant_field(self, piece, new_position):
        """ Sets en passant field coords """
        if piece.color == 'white' and (new_position[1] - piece.position[1] == 2):
            self.game.white_pawn_en_passant_val = True
            self.game.white_pawn_en_passant_field = (new_position[0], new_position[1] - 1)

            for piece_name, piece_data in self.game.white_pieces.items():
                if piece_data == piece:
                    self.game.white_pawn_en_passant_to_capture = piece_name

        elif piece.color == 'black' and (piece.position[1] - new_position[1] == 2):
            self.game.black_pawn_en_passant_val = True
            self.game.black_pawn_en_passant_field = (new_position[0], new_position[1] + 1)

            for piece_name, piece_data in self.game.black_pieces.items():
                if piece_data == piece:
                    self.game.black_pawn_en_passant_to_capture = piece_name

    def validate_move_request(self):
        """ Checks whether the move request is valid """

        if self.socket_data['color'] == 'white':
            piece = self.game.white_pieces[self.socket_data['piece']]
        elif self.socket_data['color'] == 'black':
            piece = self.game.black_pieces[self.socket_data['piece']]

        new_position = position_to_tuple(self.socket_data['new_position'])
        possible_captures = piece.capturing_moves

        en_passant_field = self.get_en_passant_field()

        if new_position in possible_captures:
            piece_to_capture = piece.capture_piece(new_position)
            _ = self.remove_piece(piece_to_capture, self.game)
            self.did_capture_in_last_move = True

        if new_position in en_passant_field:
            self.check_en_passant_field(piece)
            self.did_capture_in_last_move = True

        if piece.piece_type == 'pawn':
            self.set_en_passant_field(piece, new_position)

        piece.last_position = piece.position
        piece.position = new_position

    def add_en_passant_field(self):
        """ Checks if pawn can do en passant move """
        if self.game.white_pawn_en_passant_field:
            for _, piece in self.game.black_pieces.items():
                if (piece.piece_type == 'pawn' and
                        ((piece.position[0] == self.game.white_pawn_en_passant_field[0] + 1) or (
                                piece.position[0] == self.game.white_pawn_en_passant_field[0] - 1)) and
                        (piece.position[1] == self.game.white_pawn_en_passant_field[1] + 1)):
                    piece.capturing_moves.append(self.game.white_pawn_en_passant_field)
        elif self.game.black_pawn_en_passant_field:
            for _, piece in self.game.white_pieces.items():
                if (piece.piece_type == 'pawn' and
                        ((piece.position[0] == self.game.black_pawn_en_passant_field[0] + 1) or (
                                piece.position[0] == self.game.black_pawn_en_passant_field[0] - 1)) and
                        (piece.position[1] == self.game.black_pawn_en_passant_field[1] - 1)):
                    piece.capturing_moves.append(self.game.black_pawn_en_passant_field)

    def remove_piece(self, piece_to_remove, game) -> str:
        """ Removes piece from the board """
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

        return piece_name

    def is_capture_illegal(self, temporary_game_state, name, piece, move) -> bool:
        """ Checks if capturing is illegal """
        illegal_capture = False
        temporary_game_state.init_moves()

        if piece.color == 'white':
            temp_piece = temporary_game_state.white_pieces[name]
        elif piece.color == 'black':
            temp_piece = temporary_game_state.black_pieces[name]

        piece_to_capture = temp_piece.capture_piece(move)
        piece_name = self.remove_piece(piece_to_capture, temporary_game_state)
        temp_piece.position = move

        if not piece_name == 'king':
            temporary_game_state.init_moves()
            temporary_game_state.check_kings_safety()
        else:
            illegal_capture = True

        if ((piece.color == 'white' and temporary_game_state.white_check) or
                (piece.color == 'black' and temporary_game_state.black_check)):
            illegal_capture = True

        return illegal_capture

    def is_move_illegal(self, temporary_game_state, name, piece, move):
        """ Checks if move on an empty space is illegal """
        illegal_move = False

        if piece.color == 'white':
            temp_piece = temporary_game_state.white_pieces[name]
        elif piece.color == 'black':
            temp_piece = temporary_game_state.black_pieces[name]

        base_position = temp_piece.position
        temp_piece.position = move
        temporary_game_state.init_moves()
        temporary_game_state.check_kings_safety()

        if ((piece.color == 'white' and temporary_game_state.white_check) or
                (piece.color == 'black' and temporary_game_state.black_check)):
            illegal_move = True

        temp_piece.position = base_position

        return illegal_move

    def check_move(self, temporary_game_state, name, piece):
        """ Checks if move is illegal """
        for move in unpack_positions(piece.possible_moves):
            if self.is_move_illegal(temporary_game_state, name, piece, move):
                piece.illegal_moves.append(move)
            else:
                piece.valid_moves.append(move)

        capturing_moves_copy = copy.deepcopy(piece.capturing_moves)
        for move in piece.capturing_moves:
            capture_game_state = copy.deepcopy(temporary_game_state)

            if self.is_capture_illegal(capture_game_state, name, piece, move):
                capturing_moves_copy.remove(move)

        piece.capturing_moves = capturing_moves_copy

    def get_possible_moves(self, temporary_game_state, color):
        """ Gets possible moves for each piece in the game """
        possible_moves = []
        taken_fields = []
        number_of_moves = 0

        if color == 'white':
            pieces = self.game.white_pieces.items()
        elif color == 'black':
            pieces = self.game.black_pieces.items()

        for name, piece in pieces:
            self.check_move(temporary_game_state, name, piece)
            number_of_moves += (len(piece.valid_moves) + len(piece.capturing_moves))
            taken_fields.append(piece.position)
            for move in unpack_positions(piece.possible_moves):
                possible_moves.append(move)

        if number_of_moves == 0 and color == 'white' and self.game.white_check:
            self.game.white_checkmate = True
            self.game.white_check = False
        elif number_of_moves == 0 and color == 'black' and self.game.black_check:
            self.game.black_checkmate = True
            self.game.black_check = False

        return possible_moves, taken_fields

    def get_valid_moves(self):
        """ Gets valid and illegal moves for each piece on board """
        temporary_game_state = copy.deepcopy(self.game)
        temporary_game_state.init_moves()

        white_possible_moves, white_taken_fields = self.get_possible_moves(temporary_game_state, 'white')
        black_possible_moves, black_taken_fields = self.get_possible_moves(temporary_game_state, 'black')

        taken_fields = white_taken_fields + black_taken_fields
        self.is_castle_legal(taken_fields, white_possible_moves, black_possible_moves)

    def is_castle_legal(self, taken_fields, white_moves, black_moves):
        """ Checks whether castling is legal """
        if not self.game.white_check and not self.game.white_king_moved:
            self.check_white_short_castle(taken_fields, black_moves)
            self.check_white_long_castle(taken_fields, black_moves)

        if not self.game.black_check and not self.game.black_king_moved:
            self.check_black_short_castle(taken_fields, white_moves)
            self.check_black_long_castle(taken_fields, white_moves)

    def check_white_short_castle(self, taken_fields, enemy_moves):
        """ Checks short castle for white player """
        required_free_fields = [(6, 1), (7, 1)]
        if (not self.game.white_rook_2_moved and self.are_castle_fields_free(required_free_fields, taken_fields) and
                self.are_castle_fields_not_attacked(required_free_fields, enemy_moves)):
            self.game.white_short_castle_legal = True

    def check_white_long_castle(self, taken_fields, enemy_moves):
        """ Checks long castle for white player """
        required_free_fields = [(2, 1), (3, 1), (4, 1)]
        if (not self.game.white_rook_1_moved and self.are_castle_fields_free(required_free_fields, taken_fields) and
                self.are_castle_fields_not_attacked(required_free_fields, enemy_moves)):
            self.game.white_long_castle_legal = True

    def check_black_short_castle(self, taken_fields, enemy_moves):
        """ Checks short castle for black player """
        required_free_fields = [(6, 8), (7, 8)]
        if (not self.game.black_rook_2_moved and self.are_castle_fields_free(required_free_fields, taken_fields) and
                self.are_castle_fields_not_attacked(required_free_fields, enemy_moves)):
            self.game.black_short_castle_legal = True

    def check_black_long_castle(self, taken_fields, enemy_moves):
        """ Checks long castle for black player """
        required_free_fields = [(2, 8), (3, 8), (4, 8)]
        if (not self.game.black_rook_1_moved and self.are_castle_fields_free(required_free_fields, taken_fields) and
                self.are_castle_fields_not_attacked(required_free_fields, enemy_moves)):
            self.game.black_long_castle_legal = True

    def are_castle_fields_free(self, required_fields, taken_fields) -> bool:
        """ Verifies if all fields between rook and king are free """
        for field in required_fields:
            if field in taken_fields:
                return False
        return True

    def are_castle_fields_not_attacked(self, required_fields, enemy_pieces_moves) -> bool:
        """ Verifies if all fields between rook and king are not attacked """
        for field in required_fields:
            if field in enemy_pieces_moves:
                return False
        return True

    def do_castle(self):
        if self.socket_data['castle_type'] == 'white_short':
            self.game.white_pieces['rook_1'].position = (6, 1)
            self.game.white_pieces['king'].position = (7, 1)
        elif self.socket_data['castle_type'] == 'white_long':
            self.game.white_pieces['rook_2'].position = (3, 1)
            self.game.white_pieces['king'].position = (2, 1)
        elif self.socket_data['castle_type'] == 'black_short':
            self.game.black_pieces['rook_1'].position = (6, 8)
            self.game.black_pieces['king'].position = (7, 8)
        elif self.socket_data['castle_type'] == 'black_long':
            self.game.black_pieces['rook_1'].position = (3, 8)
            self.game.black_pieces['king'].position = (2, 8)

    def recalculate_moves(self):
        """ Executes methods required to calculate new possible moves for each piece """
        self.game.promote_pawn()
        self.game.init_moves()
        self.game.check_kings_safety()
        self.add_en_passant_field()
        self.get_valid_moves()

    def is_move_ambiguous(self) -> bool:
        """ Checks if the is ambiguous for this type of piece """
        if self.socket_data['color'] == 'white':
            moving_piece = self.game.white_pieces[self.socket_data['piece']]
            friendly_pieces = [piece for piece in self.game.white_pieces.values()
                               if isinstance(piece, type(moving_piece)) and piece is not moving_piece]
        elif self.socket_data['color'] == 'black':
            moving_piece = self.game.black_pieces[self.socket_data['piece']]
            friendly_pieces = [piece for piece in self.game.black_pieces.values()
                               if isinstance(piece, type(moving_piece)) and piece is not moving_piece]

        if isinstance(moving_piece, PiecePawn) or self.game.promoting_move:
            position_str = str(moving_piece.last_position[0]) + str(moving_piece.last_position[1])
            position_in_notation = get_position_in_chess_notation(position_str)
            self.pawn_last_position_column_notation = position_in_notation[0]

        for piece in friendly_pieces:
            for move_set in piece.all_moves:
                if moving_piece.position in move_set:
                    self.get_ambiguous_move_identifier(moving_piece, piece)
                    return True

        return False

    def get_ambiguous_move_identifier(self, moving_piece, second_piece):
        position_str = str(moving_piece.last_position[0]) + str(moving_piece.last_position[1])
        position_in_notation = get_position_in_chess_notation(position_str)
        if moving_piece.last_position[0] == second_piece.position[0]:
            self.ambiguous_move_identifier = position_in_notation[1]
        elif moving_piece.last_position[1] == second_piece.position[1]:
            self.ambiguous_move_identifier = position_in_notation[0]
