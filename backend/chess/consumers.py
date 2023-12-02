from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame, WhitePieces, BlackPieces
from .chess_logic import GameLoader
from .utils import (edit_board_in_db, create_board_in_db, read_model_fields, validate_move_request, prepare_data)
from asgiref.sync import async_to_sync
import json


class GameDataHandler:
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
        white_board = {"game_id": game_id}
        black_board = {"game_id": game_id}

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
                    white_board[name] = piece_info

                elif color == 'black':
                    black_board[name] = piece_info

        if WhitePieces.objects.filter(game_id=game_id).exists() and BlackPieces.objects.filter(
                game_id=game_id).exists():
            edit_board_in_db(white_board, black_board, game_id)
        else:
            create_board_in_db(white_board, black_board)

    def get_possible_moves(self, white_pieces_data, black_pieces_data):
        """ Gets list of possible_moves for each piece """
        game = GameLoader(room_id=self.room_id)
        game.create_pieces_objects(white_pieces_data, black_pieces_data)
        game.init_moves()
        return game

    def read_board_from_db(self):
        """ Reads pieces info from databse """
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
            updated_game = validate_move_request(data_json, read_game)
            updated_game.init_moves()
            self.save_board_state_to_db(updated_game)
            self.read_board_from_db()
            self.send_board_state(updated_game)
        elif data_json['data_type'] == 'init_board':
            initialized_game = self.initialize_board()
            self.save_board_state_to_db(initialized_game)
            read_game = self.read_board_from_db()
            self.send_board_state(read_game)

    def send_board_state(self, game):
        """ Triggers send_positions with chess pieces data """
        white_pieces_data = prepare_data(game.white_pieces.items())
        black_pieces_data = prepare_data(game.black_pieces.items())

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_positions',
                'white_pieces': white_pieces_data,
                'black_pieces': black_pieces_data
            }
        )

    def send_positions(self, event):
        """ Sends data about pieces on board """
        self.send(text_data=json.dumps({
            'white_pieces': event['white_pieces'],
            'black_pieces': event['black_pieces']
        }))

    def disconnect(self, code):
        """ Removes user from disconnected websocket """
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
