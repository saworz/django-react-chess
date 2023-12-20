from .models import ChessGame, WhitePieces, BlackPieces
from .chess_logic import GameLoader


class GameHandler:
    def __init__(self, room_id):
        self.room_id = room_id

    def initialize_board(self):
        """ Initializes positions for a new game """
        game = GameLoader(room_id=self.room_id)
        game.create_board()
        game.init_moves()
        return game

    def init_board_from_db(self, db_game_state):
        """ Gets list of possible_moves for each piece """
        game = GameLoader(room_id=self.room_id)
        game.create_pieces_objects(db_game_state['white_pieces'], db_game_state['black_pieces'])
        game.init_moves()

        white_castle_data = db_game_state['white_castle']
        black_castle_data = db_game_state['black_castle']

        game.white_rook_1_moved = white_castle_data['rook_1_moved']
        game.white_rook_2_moved = white_castle_data['rook_2_moved']
        game.white_king_moved = white_castle_data['king_moved']
        game.black_rook_1_moved = black_castle_data['rook_1_moved']
        game.black_rook_2_moved = black_castle_data['rook_2_moved']
        game.black_king_moved = black_castle_data['king_moved']
        game.white_castled = white_castle_data['castled']
        game.black_castled = black_castle_data['castled']

        game.white_pawn_en_passant_field = db_game_state['white_en_passant_field']
        game.black_pawn_en_passant_field = db_game_state['black_en_passant_field']
        return game
