import asyncio

from channels.exceptions import StopConsumer
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from .models import ChessGame, PlayersQueue
from .chess_game import GameHandler
from .chess_db import DatabaseHandler
from .utils import (prepare_data)
from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async
import json


class ChessConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.game_handler = None
        self.database = None

    def connect(self):
        """ Handles websocket connection """
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_name = self.room_id
        self.room_group_name = f"game_{self.room_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
        )

        if ChessGame.objects.filter(room_id=self.room_id).exists():
            self.accept()

    def receive(self, text_data):
        """ Handles data sent in websocket """
        data_json = json.loads(text_data)
        self.game_handler = GameHandler(room_id=self.room_id, socket_data=data_json)
        self.database = DatabaseHandler(room_id=self.room_id, socket_data=data_json, game=self.game_handler)

        if data_json['data_type'] == 'move':
            db_game_state = self.database.read_board_from_db()
            self.game_handler.init_board_from_db(db_game_state)
            error = self.game_handler.validate_move_request()

            if error:
                self.trigger_send_error(error)

            self.database.update_player_turn()
            self.game_handler.recalculate_moves()
            self.database.save_board_state_to_db()
            self.trigger_send_board_state("move")
        elif data_json['data_type'] == 'castle':
            db_game_state = self.database.read_board_from_db()
            self.game_handler.init_board_from_db(db_game_state)
            self.game_handler.do_castle()
            self.database.update_player_turn()
            self.game_handler.recalculate_moves()
            self.database.save_board_state_to_db()
            self.trigger_send_board_state("move")
        elif data_json['data_type'] == 'init_board':
            self.game_handler.initialize_board()
            self.database.save_board_state_to_db()
            self.game_handler.get_valid_moves()
            self.trigger_send_board_state("init")

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

    def trigger_send_board_state(self, send_type):
        """ Triggers send_board_state with chess pieces data """
        game = self.game_handler.game
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
                'black_long_castle_legal': game.black_long_castle_legal,

                'white_en_passant_valid': game.white_pawn_en_passant_val,
                'white_en_passant_field': game.white_pawn_en_passant_field,
                'white_en_passant_pawn_to_capture': game.white_pawn_en_passant_to_capture,
                'black_en_passant_valid': game.black_pawn_en_passant_val,
                'black_en_passant_field': game.black_pawn_en_passant_field,
                'black_en_passant_pawn_to_capture': game.black_pawn_en_passant_to_capture,

                'white_score': game.white_score,
                'white_captured_pieces': game.white_captured_pieces,
                'black_score': game.black_score,
                'black_captured_pieces': game.black_captured_pieces,

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

            'white_en_passant_valid': event['white_en_passant_valid'],
            'white_en_passant_field': event['white_en_passant_field'],
            'white_en_passant_pawn_to_capture': event['white_en_passant_pawn_to_capture'],
            'black_en_passant_valid': event['black_en_passant_valid'],
            'black_en_passant_field': event['black_en_passant_field'],
            'black_en_passant_pawn_to_capture': event['black_en_passant_pawn_to_capture'],

            'white_score': event['white_score'],
            'white_captured_pieces': event['white_captured_pieces'],
            'black_score': event['black_score'],
            'black_captured_pieces': event['black_captured_pieces'],

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


class QueueConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user_pk = None
        self.player_1 = None
        self.player_2 = None
        self.queue_instance = None

    def is_in_queue(self):
        if self.queue_instance.users_in_queue:
            queue_list = [int(num) for num in self.queue_instance.users_in_queue.split(',')]
            if int(self.user_pk) in queue_list:
                return True
        return False

    def update_instance(self):
        self.setup_queue_instance()
        if not self.queue_instance.users_in_queue:
            update_value = str(self.user_pk)
        else:
            update_value = ',' + str(self.user_pk)

        if not self.is_in_queue():
            self.queue_instance.users_in_queue += update_value
            self.queue_instance.save()

    def found_players_pair(self):
        queue_list = [int(num) for num in self.queue_instance.users_in_queue.split(',')]
        print(queue_list)

    def remove_from_queue(self):
        self.setup_queue_instance()
        queue_list = [int(num) for num in self.queue_instance.users_in_queue.split(',')]
        queue_list.remove(int(self.user_pk))

        self.queue_instance.users_in_queue = ','.join(map(str, queue_list))
        self.queue_instance.save()


    # def look_for_matchup(self):
    #     while True:
    #         # if await self.found_players_pair():
    #             # print("GOT THEM!!!!")
    #             # print(self.player_1, self.player_2)
    #         await asyncio.sleep(2)
    #
    #         if not self.websocket_open:
    #             break
    #
    #     print("Disconnecting by def")
    #     # await self.remove_from_queue()
    #     await self.close()

    def setup_queue_instance(self):
        if PlayersQueue.objects.all().count() == 0:
            self.queue_instance = PlayersQueue.objects.create()
        else:
            self.queue_instance = PlayersQueue.objects.all().first()

    def connect(self):
        self.user_pk = self.scope['url_route']['kwargs']['user_pk']

        self.accept()
        self.update_instance()

        # self.look_for_matchup()

    def trigger_send_enemy_data(self):
        """ Triggers send_board_state with chess pieces data """

        async_to_sync(self.channel_layer.group_send)(
            {
                'type': 'send_enemy_data',
                'player_1': self.player_1,
                'player_2': self.player_2
            }
        )

    def send_enemy_data(self, event):
        """ Sends chat message """
        self.send(text_data=json.dumps({
            'type': 'enemy_data',
            'player_1': event['player_1'],
            'player_2': event['player_2']
        }))

    def disconnect(self, code):
        self.remove_from_queue()

# class QueueConsumer(AsyncWebsocketConsumer):
#     def __init__(self, *args, **kwargs):
#         super().__init__(args, kwargs)
#         self.user_pk = None
#         self.player_1 = None
#         self.player_2 = None
#         self.queue_instance = None
#         self.websocket_open = False
#
#     def is_in_queue(self):
#         if self.queue_instance.users_in_queue:
#             queue_list = [int(num) for num in self.queue_instance.users_in_queue.split(',')]
#             if int(self.user_pk) in queue_list:
#                 return True
#         return False
#
#     async def update_instance(self):
#         if not self.queue_instance.users_in_queue:
#             update_value = str(self.user_pk)
#         else:
#             update_value = ',' + str(self.user_pk)
#
#         if not self.is_in_queue():
#             self.queue_instance.users_in_queue += update_value
#             print("Saving")
#             print(self.queue_instance.users_in_queue)
#             sync_to_async(self.queue_instance.save)()
#             print("Saved")
#             print(self.queue_instance.users_in_queue)
#
#     async def found_players_pair(self):
#         queue_list = [int(num) for num in self.queue_instance.users_in_queue.split(',')]
#         print(queue_list)
#
#     # async def remove_from_queue(self):
#     #     queue_list = [int(num) for num in self.queue_instance.users_in_queue.split(',')]
#     #     print(queue_list, self.user_pk)
#     #     queue_list.remove(int(self.user_pk))
#     #     print(queue_list)
#     #     if len(queue_list) > 0:
#     #         self.queue_instance.users_in_queue = ','.join(map(str, queue_list))
#     #     else:
#     #         self.queue_instance.users_in_queue = ''
#     #     sync_to_async(self.queue_instance.save)()
#
#     async def look_for_matchup(self):
#         while True:
#             # if await self.found_players_pair():
#                 # print("GOT THEM!!!!")
#                 # print(self.player_1, self.player_2)
#             await asyncio.sleep(2)
#
#             if not self.websocket_open:
#                 break
#
#         print("Disconnecting by def")
#         # await self.remove_from_queue()
#         await self.close()
#
#     @sync_to_async
#     def setup_queue_instance(self):
#         if PlayersQueue.objects.all().count() == 0:
#             self.queue_instance = PlayersQueue.objects.create()
#         else:
#             self.queue_instance = PlayersQueue.objects.all().first()
#
#     async def connect(self):
#         self.user_pk = self.scope['url_route']['kwargs']['user_pk']
#
#         await self.accept()
#         self.websocket_open = True
#         await self.setup_queue_instance()
#         print("GOT INSTANCE")
#         print(self.queue_instance.users_in_queue)
#         await self.update_instance()
#         await self.look_for_matchup()
#
#     async def trigger_send_enemy_data(self):
#         """ Triggers send_board_state with chess pieces data """
#
#         async_to_sync(self.channel_layer.group_send)(
#             {
#                 'type': 'send_enemy_data',
#                 'player_1': self.player_1,
#                 'player_2': self.player_2
#             }
#         )
#
#     async def send_enemy_data(self, event):
#         """ Sends chat message """
#         await self.send(text_data=json.dumps({
#             'type': 'enemy_data',
#             'player_1': event['player_1'],
#             'player_2': event['player_2']
#         }))
#
#     async def disconnect(self, code):
#         """ Removes user from disconnected websocket """
#         self.websocket_open = False
#         async_to_sync(self.channel_layer.group_discard)(
#             self.room_group_name,
#             self.channel_name
#         )
#         raise StopConsumer()
