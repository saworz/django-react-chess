import copy

from .models import ChessGame, WhitePieces, BlackPieces
from .chess_logic import GameLoader
from .utils import position_to_tuple, unpack_positions, remove_piece


class GameHandler:
    def __init__(self, room_id):
        self.room_id = room_id
        self.game = None

    def initialize_board(self):
        """ Initializes positions for a new game """
        self.game = GameLoader(room_id=self.room_id)
        self.game.create_board()
        self.game.init_moves()

    def set_castle_data(self, white_castle_data, black_castle_data):
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
        self.game = GameLoader(room_id=self.room_id)
        self.game.create_pieces_objects(db_game_state['white_pieces'], db_game_state['black_pieces'])
        self.game.init_moves()

        white_castle_data = db_game_state['white_castle']
        black_castle_data = db_game_state['black_castle']
        self.set_castle_data(white_castle_data, black_castle_data)

        self.game.white_pawn_en_passant_field = db_game_state['white_en_passant_field']
        self.game.black_pawn_en_passant_field = db_game_state['black_en_passant_field']

    def check_en_passant_field(self, piece):
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

        _ = remove_piece(piece_to_capture, self.game)

    def get_en_passant_field(self):
        en_passant_field = []

        if self.game.white_pawn_en_passant_field:
            en_passant_field.append(position_to_tuple(self.game.white_pawn_en_passant_field))
        elif self.game.black_pawn_en_passant_field:
            en_passant_field.append(position_to_tuple(self.game.black_pawn_en_passant_field))

        return en_passant_field

    def reset_en_passant_fields(self):
        self.game.white_pawn_en_passant_val = False
        self.game.white_pawn_en_passant_field = ''
        self.game.black_pawn_en_passant_val = False
        self.game.black_pawn_en_passant_field = ''

    def set_en_passant_field(self, piece, new_position):
        if piece.color == 'white' and (new_position[1] - piece.position[1] == 2):
            self.game.white_pawn_en_passant_val = True
            self.game.white_pawn_en_passant_field = (new_position[0], new_position[1] - 1)
        elif piece.color == 'black' and (piece.position[1] - new_position[1] == 2):
            self.game.black_pawn_en_passant_val = True
            self.game.black_pawn_en_passant_field = (new_position[0], new_position[1] + 1)

    def validate_move_request(self, move_data):
        """ Checks whether the move request is valid """

        if move_data['color'] == 'white':
            piece = self.game.white_pieces[move_data['piece']]
        elif move_data['color'] == 'black':
            piece = self.game.black_pieces[move_data['piece']]

        new_position = position_to_tuple(move_data['new_position'])
        possible_positions = unpack_positions(piece.possible_moves)
        possible_captures = piece.capturing_moves

        en_passant_field = self.get_en_passant_field()

        if new_position not in (possible_positions + possible_captures + en_passant_field):
            error_message = "Incorrect request"
            error = {'message': error_message}
            return error

        if new_position in possible_captures:
            piece_to_capture = piece.capture_piece(new_position)
            _ = remove_piece(piece_to_capture, self.game)

        if new_position == en_passant_field:
            self.check_en_passant_field(piece)

        self.reset_en_passant_fields()

        if piece.piece_type == 'pawn':
            self.set_en_passant_field(piece, new_position)

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

    def is_capture_illegal(self, temporary_game_state, name, piece, move):
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

        if number_of_moves == 0 and color == 'white':
            self.game.white_checkmate = True
            self.game.white_check = False
        elif number_of_moves == 0 and color == 'black':
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
        self.game.white_short_castle_legal = False
        self.game.black_short_castle_legal = False
        self.game.white_long_castle_legal = False
        self.game.black_long_castle_legal = False

        if not self.game.white_check and not self.game.white_king_moved:
            self.check_white_short_castle(taken_fields, black_moves)
            self.check_white_long_castle(taken_fields, black_moves)

        if not self.game.black_check and not self.game.black_king_moved:
            self.check_black_short_castle(taken_fields, white_moves)
            self.check_black_long_castle(taken_fields, white_moves)

        print("CHECKING WHITE CASTLE:")
        print(self.game.white_short_castle_legal, self.game.white_long_castle_legal)
        print("CHECKING BLACK CASTLE:")
        print(self.game.black_short_castle_legal, self.game.black_long_castle_legal)

    def check_white_short_castle(self, taken_fields, enemy_moves):
        required_free_fields = [(6, 1), (7, 1)]
        if (not self.game.white_rook_2_moved and self.are_castle_fields_free(required_free_fields, taken_fields) and
                self.are_castle_fields_not_attacked(required_free_fields, enemy_moves)):
            self.game.white_short_castle_legal = True

    def check_white_long_castle(self, taken_fields, enemy_moves):
        required_free_fields = [(2, 1), (3, 1), (4, 1)]
        if (not self.game.white_rook_1_moved and self.are_castle_fields_free(required_free_fields, taken_fields) and
                self.are_castle_fields_not_attacked(required_free_fields, enemy_moves)):
            self.game.white_long_castle_legal = True

    def check_black_short_castle(self, taken_fields, enemy_moves):
        required_free_fields = [(6, 8), (7, 8)]
        if (not self.game.black_rook_2_moved and self.are_castle_fields_free(required_free_fields, taken_fields) and
                self.are_castle_fields_not_attacked(required_free_fields, enemy_moves)):
            self.game.black_short_castle_legal = True

    def check_black_long_castle(self, taken_fields, enemy_moves):
        required_free_fields = [(2, 8), (3, 8), (4, 8)]
        if (not self.game.black_rook_1_moved and self.are_castle_fields_free(required_free_fields, taken_fields) and
                self.are_castle_fields_not_attacked(required_free_fields, enemy_moves)):
            self.game.black_long_castle_legal = True

    def are_castle_fields_free(self, required_fields, taken_fields):
        for field in required_fields:
            if field in taken_fields:
                return False
        return True

    def are_castle_fields_not_attacked(self, required_fields, enemy_pieces_moves):
        for field in required_fields:
            if field in enemy_pieces_moves:
                return False
        return True

    def recalculate_moves(self):
        self.game.init_moves()
        self.game.check_kings_safety()
        self.add_en_passant_field()
        self.get_valid_moves()
