from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame, WhitePieces, BlackPieces
from .chess_logic import GameLoader
from .utils import (edit_board_in_db, create_board_in_db, read_model_fields, validate_move_request, prepare_data,
                    get_valid_moves)
from asgiref.sync import async_to_sync
import json
import time


class GameDataHandler:
    def __init__(self):
        self.white_board = {}
        self.black_board = {}

    def initialize_board(self):
        """ Initializes positions for a new game """
        game = GameLoader(room_id=self.room_id)
        game.create_board()
        game.init_moves()
        return game

    def save_board_state_to_db(self, game, socket_data=None):
        """ Saves board state to database """
        sides = {
            "white": game.white_pieces,
            "black": game.black_pieces
        }

        game_id = ChessGame.objects.get(room_id=self.room_id).pk
        current_player = ChessGame.objects.get(room_id=self.room_id).current_player
        self.white_board = {"game_id": game_id}
        self.black_board = {"game_id": game_id}

        for color, board in sides.items():
            for name, piece in board.items():
                piece_info = {
                    "piece_type": piece.piece_type,
                    "position": piece.position,
                    "color": piece.color,
                    "possible_moves": piece.possible_moves,
                    "capturing_moves": piece.capturing_moves,
                }

                if color == 'white':
                    self.white_board[name] = piece_info
                elif color == 'black':
                    self.black_board[name] = piece_info

        if WhitePieces.objects.filter(game_id=game_id).exists() and BlackPieces.objects.filter(
                game_id=game_id).exists():
            edit_board_in_db(self.white_board, self.black_board, game_id, game, socket_data)
        else:
            create_board_in_db(self.white_board, self.black_board)

        return current_player

    def save_illegal_moves_to_db(self, game):
        white_pieces_dict = {field_name: value for field_name, value in
                             self.white_board.items() if field_name != "game_id"}
        black_pieces_dict = {field_name: value for field_name, value in
                             self.black_board.items() if field_name != "game_id"}

        new_white_board_data = {}
        new_black_board_data = {}
        for (db_field, db_data), (piece_name, piece) in zip(white_pieces_dict.items(), game.white_pieces.items()):
            piece_info = db_data
            piece_info['illegal_moves'] = piece.illegal_moves
            piece_info['valid_moves'] = piece.valid_moves
            new_white_board_data[db_field] = piece_info
        for (db_field, db_data), (piece_name, piece) in zip(black_pieces_dict.items(), game.black_pieces.items()):
            piece_info = db_data
            piece_info['illegal_moves'] = piece.illegal_moves
            piece_info['valid_moves'] = piece.valid_moves
            new_black_board_data[db_field] = piece_info

        game_id = ChessGame.objects.get(room_id=self.room_id).pk
        new_white_board_data['game_id'] = game_id
        new_black_board_data['game_id'] = game_id

        edit_board_in_db(new_white_board_data, new_black_board_data, game_id)

    def get_possible_moves(self, white_pieces_data, black_pieces_data):
        """ Gets list of possible_moves for each piece """
        game = GameLoader(room_id=self.room_id)
        game.create_pieces_objects(white_pieces_data, black_pieces_data)
        game.init_moves()
        return game

    def set_castle_data(self, game, white_castle_data, black_castle_data):
        game.white_rook_1_moved = white_castle_data['rook_1_moved']
        game.white_rook_2_moved = white_castle_data['rook_2_moved']
        game.white_king_moved = white_castle_data['king_moved']
        game.black_rook_1_moved = black_castle_data['rook_1_moved']
        game.black_rook_2_moved = black_castle_data['rook_2_moved']
        game.black_king_moved = black_castle_data['king_moved']
        game.white_castled = white_castle_data['castled']
        game.black_castled = black_castle_data['castled']
        return game

    def read_board_from_db(self):
        """ Reads pieces info from database """
        game_id = ChessGame.objects.get(room_id=self.room_id).pk
        white_board = WhitePieces.objects.get(game_id=game_id)
        black_board = BlackPieces.objects.get(game_id=game_id)

        white_pieces_data, white_castle_data = read_model_fields(white_board)
        black_pieces_data, black_castle_data = read_model_fields(black_board)

        game = self.get_possible_moves(white_pieces_data, black_pieces_data)
        game = self.set_castle_data(game, white_castle_data, black_castle_data)
        return game


class ChessConsumer(WebsocketConsumer, GameDataHandler):
    def connect(self):
        """ Handles websocket connection """
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_name = self.room_id
        self.room_group_name = f"game_{self.room_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        if ChessGame.objects.filter(room_id=self.room_id).exists():
            self.accept()

    def receive(self, text_data):
        """ Handles data sent in websocket """
        data_json = json.loads(text_data)

        if data_json['data_type'] == 'move':
            read_game = self.read_board_from_db()
            response = validate_move_request(data_json, read_game, self.room_id)

            if isinstance(response, GameLoader):
                updated_game = response
            else:
                updated_game = read_game
                self.trigger_send_error(response)

            updated_game.init_moves()
            updated_game.check_king_safety()
            self.save_board_state_to_db(updated_game, data_json)
            get_valid_moves(updated_game)
            self.save_illegal_moves_to_db(updated_game)
            self.trigger_send_board_state(updated_game, "move")
        elif data_json['data_type'] == 'init_board':
            initialized_game = self.initialize_board()
            self.save_board_state_to_db(initialized_game)
            get_valid_moves(initialized_game)
            self.save_illegal_moves_to_db(initialized_game)
            self.trigger_send_board_state(initialized_game, "init")

        elif data_json['data_type'] == 'chat_message':
            self.trigger_send_message(data_json['message'])

    def trigger_send_message(self, message):
        """ Triggers sending message via websocket """
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_message',
                'message': message,
                'sender': self.scope['user'].pk
            }
        )

    def trigger_send_error(self, error):
        """ Triggers sending an error via websocket """
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_error',
                'message': error['message'],
                'king_position': error['king_position']
            }
        )

    def trigger_send_board_state(self, game, send_type):
        """ Triggers send_board_state with chess pieces data """
        white_pieces_data = prepare_data(game.white_pieces.items())
        black_pieces_data = prepare_data(game.black_pieces.items())
        current_player = ChessGame.objects.get(room_id=self.room_id).current_player


        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_board_state',
                'current_player': current_player,
                'white_pieces': white_pieces_data,
                'black_pieces': black_pieces_data,

                'white_checked': game.white_check,
                'white_checkmated': game.white_checkmate,
                'black_checked': game.black_check,
                'black_checkmated': game.black_checkmate,

                'white_short_castle_legal': game.white_short_castle_legal,
                'white_long_castle_legal': game.white_long_castle_legal,
                'black_short_castle_legal': game.black_short_castle_legal,
                'black_long_castle_legal': game.black_short_castle_legal,
                'send_type': send_type,
            }
        )

    def send_message(self, event):
        """ Sends chat message """
        self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender': event['sender']
        }))

    def send_board_state(self, event):
        """ Sends data about board """
        self.send(text_data=json.dumps({
            'type': event['send_type'],
            'current_player': event['current_player'],

            'white_pieces': event['white_pieces'],
            'black_pieces': event['black_pieces'],

            'white_checked': event['white_checked'],
            'white_checkmated': event['white_checkmated'],
            'black_checked': event['black_checked'],
            'black_checkmated': event['black_checkmated'],

            'white_short_castle_legal': event['white_short_castle_legal'],
            'white_long_castle_legal': event['white_long_castle_legal'],
            'black_short_castle_legal': event['black_short_castle_legal'],
            'black_long_castle_legal': event['black_long_castle_legal'],
        }))

    def send_error(self, event):
        """ Sends error """
        self.send(text_data=json.dumps({
            'type': 'error',
            'message': event['message'],
            'king_position': event['king_position']
        }))

    def disconnect(self, code):
        """ Removes user from disconnected websocket """
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
