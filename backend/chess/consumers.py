from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame
from .chess_game import GameHandler
from .chess_db import DatabaseHandler
from .utils import (prepare_data)
from asgiref.sync import async_to_sync
import json


class ChessConsumer(WebsocketConsumer):
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
        game = GameHandler(room_id=self.room_id)
        database = DatabaseHandler(room_id=self.room_id)

        data_json = json.loads(text_data)

        if data_json['data_type'] == 'move':
            db_game_state = database.read_board_from_db()
            game.init_board_from_db(db_game_state)
            error = game.validate_move_request(data_json)

            if error:
                self.trigger_send_error(error)

            database.update_player_turn()
            game.recalculate_moves()
            database.save_board_state_to_db(game, data_json)
            # self.save_illegal_moves_to_db(updated_game)
            self.trigger_send_board_state(game, "move")
        elif data_json['data_type'] == 'init_board':
            game.initialize_board()
            database.save_board_state_to_db(game)
            game.get_valid_moves()
            # self.save_illegal_moves_to_db(initialized_game)
            self.trigger_send_board_state(game, "init")

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

    def trigger_send_board_state(self, game_instance, send_type):
        """ Triggers send_board_state with chess pieces data """
        game = game_instance.game
        white_pieces_data = prepare_data(game.white_pieces.items())
        black_pieces_data = prepare_data(game.black_pieces.items())
        current_player = ChessGame.objects.get(room_id=self.room_id).current_player

        print("WHITE CHECK / CHECKMATE")
        print(game.white_check, game.white_checkmate)
        print("BLACK CHECK / CHECKMATE")
        print(game.black_check, game.black_checkmate)

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
