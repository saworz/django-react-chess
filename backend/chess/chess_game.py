import copy

from .models import ChessGame, WhitePieces, BlackPieces
from .chess_logic import GameLoader
from .utils import position_to_tuple, unpack_positions, remove_piece, is_castle_legal, check_move


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

    def get_possible_moves(self, temporary_game_state, color):
        possible_moves = []
        taken_fields = []
        number_of_moves = 0

        if color == 'white':
            pieces = self.game.white_pieces.items()
        elif color == 'black':
            pieces = self.game.black_pieces.items()

        for name, piece in pieces:
            check_move(temporary_game_state, name, piece)
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
        is_castle_legal(self.game, taken_fields, white_possible_moves, black_possible_moves)

    def recalculate_moves(self):
        self.game.init_moves()
        self.game.check_kings_safety()
        self.add_en_passant_field()
        self.get_valid_moves()
