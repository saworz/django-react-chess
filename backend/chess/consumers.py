from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame, WhitePieces, BlackPieces
from .chess_logic import GameLoader
from .utils import (edit_board_in_db, create_board_in_db, read_model_fields, validate_move_request, prepare_data,
                    get_illegal_moves)
from asgiref.sync import async_to_sync
import json


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

    def save_board_state_to_db(self, game):
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
            edit_board_in_db(self.white_board, self.black_board, game_id, current_player)
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
            new_white_board_data[db_field] = piece_info
        for (db_field, db_data), (piece_name, piece) in zip(black_pieces_dict.items(), game.black_pieces.items()):
            piece_info = db_data
            piece_info['illegal_moves'] = piece.illegal_moves
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

    def read_board_from_db(self):
        """ Reads pieces info from database """
        game_id = ChessGame.objects.get(room_id=self.room_id).pk
        white_board = WhitePieces.objects.get(game_id=game_id)
        black_board = BlackPieces.objects.get(game_id=game_id)

        white_pieces_data = read_model_fields(white_board)
        black_pieces_data = read_model_fields(black_board)

        game = self.get_possible_moves(white_pieces_data, black_pieces_data)
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
            current_player = self.save_board_state_to_db(updated_game)
            self.trigger_send_board_state(updated_game, current_player)
            get_illegal_moves(updated_game)
            self.save_illegal_moves_to_db(updated_game)

        elif data_json['data_type'] == 'init_board':
            initialized_game = self.initialize_board()
            current_player = self.save_board_state_to_db(initialized_game)
            read_game = self.read_board_from_db()
            self.trigger_send_board_state(read_game, current_player)
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

    def trigger_send_board_state(self, game, current_player):
        """ Triggers send_board_state with chess pieces data """
        white_pieces_data = prepare_data(game.white_pieces.items())
        black_pieces_data = prepare_data(game.black_pieces.items())

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_board_state',
                'current_player': current_player,
                'white_pieces': white_pieces_data,
                'black_pieces': black_pieces_data,

                'white_checked': game.white_check,
                'white_checkmated': False,
                'black_checked': game.black_check,
                'black_checkmated': False
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
            'data_type': 'move',
            'current_player': event['current_player'],
            'white_pieces': event['white_pieces'],
            'black_pieces': event['black_pieces'],
            'white_checked': event['white_checked'],
            'white_checkmated': event['white_checkmated'],
            'black_checked': event['black_checked'],
            'black_checkmated': event['black_checkmated']
        }))

    def send_error(self, event):
        """ Sends error """
        self.send(text_data=json.dumps({
            'data_type': 'error',
            'message': event['message'],
            'king_position': event['king_position']
        }))

    def disconnect(self, code):
        """ Removes user from disconnected websocket """
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
