import random
import json
from channels.generic.websocket import WebsocketConsumer
from .models import ChessGame, PlayersQueue, ConnectedPlayers
from .chess_game import GameHandler
from .chess_db import DatabaseHandler
from .utils import prepare_data, get_position_in_chess_notation, NOTATION_MAPPING
from .chess_notation import NotationCreator
from asgiref.sync import async_to_sync


class ChessConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.data_json = None
        self.game_handler = None
        self.database = None
        self.chess_notation = ''

    def connect(self):
        """ Handles websocket connection """
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_name = self.room_id
        self.room_group_name = f"game_{self.room_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.add_player_to_connected_players()
        self.accept()

    def receive(self, text_data):
        """ Handles data sent in websocket """
        self.data_json = json.loads(text_data)
        self.game_handler = GameHandler(room_id=self.room_id, socket_data=self.data_json)
        self.database = DatabaseHandler(room_id=self.room_id, socket_data=self.data_json, game=self.game_handler)

        if self.data_json['data_type'] == 'move':
            self.handle_move_event()

        elif self.data_json['data_type'] == 'castle':
            self.handle_castle_event()

        elif self.data_json['data_type'] == 'init_board':
            if ChessGame.objects.get(room_id=self.room_id).waiting_for_first_move:
                self.handle_creating_new_board()
            else:
                self.handle_loading_existing_board()

        elif self.data_json['data_type'] == 'timeout':
            self.handle_timeout()

    def handle_move_event(self):
        """ Handles moving piece """
        db_game_state = self.database.read_board_from_db()
        self.game_handler.init_board_from_db(db_game_state)
        error = self.game_handler.validate_move_request()

        if error:
            self.trigger_send_error(error)

        self.database.update_player_turn()
        self.game_handler.recalculate_moves()
        self.database.save_board_state_to_db()
        self.create_chess_notation(self.data_json)
        self.trigger_send_board_state("move")

    def handle_castle_event(self):
        """ Handles executing castling """
        db_game_state = self.database.read_board_from_db()
        self.game_handler.init_board_from_db(db_game_state)
        self.game_handler.do_castle()
        self.database.update_player_turn()
        self.game_handler.recalculate_moves()
        self.database.save_board_state_to_db()
        self.create_chess_notation(self.data_json)
        self.trigger_send_board_state("move")

    def handle_creating_new_board(self):
        """ Handles creating new board """
        self.game_handler.initialize_board()
        self.database.save_board_state_to_db()
        self.game_handler.get_valid_moves()
        self.trigger_send_board_state("init")

    def handle_loading_existing_board(self):
        """ Handles loading existing board from database """
        db_game_state = self.database.read_board_from_db()
        self.game_handler.init_board_from_db(db_game_state)
        self.game_handler.recalculate_moves()
        self.database.update_time_left()
        self.trigger_send_board_state("move")

    def handle_timeout(self):
        if ChessGame.objects.filter(room_id=self.room_id).exists():
            game = ChessGame.objects.get(room_id=self.room_id)
            game.delete()

    def create_chess_notation(self, move_data):
        """ Handles creating chess move notation """
        moving_piece_notation = None
        new_position_notation = None
        castle_type = None
        promote_to = None
        game = self.game_handler.game

        if move_data["data_type"] == "move":
            moving_piece_notation = NOTATION_MAPPING[move_data["piece"].split("_")[0]]
            new_position_notation = get_position_in_chess_notation(move_data["new_position"])

            is_move_ambiguous = self.game_handler.is_move_ambiguous()

            if move_data["promote_to"]:
                promote_to = NOTATION_MAPPING[move_data["promote_to"]]

            if move_data["color"] == "white":
                is_checked = game.black_check
                is_checkmated = game.black_checkmate

            elif move_data["color"] == "black":
                is_checked = game.white_check
                is_checkmated = game.white_checkmate

        elif move_data["data_type"] == "castle":
            castle_type = move_data["castle_type"]
            is_move_ambiguous = False
            is_checked = False
            is_checkmated = False

        notation_creator = NotationCreator(piece_symbol=moving_piece_notation,
                                           pawn_column=self.game_handler.pawn_last_position_column_notation,
                                           new_position=new_position_notation,
                                           is_move_ambiguous=is_move_ambiguous,
                                           ambiguous_move_identifier=self.game_handler.ambiguous_move_identifier,
                                           did_capture_in_last_move=self.game_handler.did_capture_in_last_move,
                                           castle_type=castle_type,
                                           promote_to=promote_to,
                                           is_checked=is_checked,
                                           is_checkmated=is_checkmated)

        self.chess_notation = notation_creator.get_notation()

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

        game_object = ChessGame.objects.get(room_id=self.room_id)
        current_player = game_object.current_player

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_board_state',
                'current_player': current_player,

                'white_time_left': str(game_object.white_time),
                'black_time_left': str(game_object.black_time),
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

                'move_in_chess_notation': self.chess_notation,
                'send_type': send_type,
            }
        )

    def send_board_state(self, event):
        """ Sends data about board """
        self.send(text_data=json.dumps({
            'type': event['send_type'],
            'current_player': event['current_player'],
            'white_time_left': event['white_time_left'],
            'black_time_left': event['black_time_left'],
            'move_in_chess_notation': event['move_in_chess_notation'],

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

    def add_player_to_connected_players(self):
        if ChessGame.objects.filter(room_id=self.room_id).exists():
            game = ChessGame.objects.get(room_id=self.room_id)
            connected_players, created = ConnectedPlayers.objects.get_or_create(game_id=game)

            user_pk = self.scope['user'].pk

            if user_pk == game.player_white.pk:
                connected_players.white_player_pk = user_pk
            elif game.player_black.pk:
                connected_players.black_player_pk = user_pk

            connected_players.save()

    def remove_player_from_connected_players(self):
        if ChessGame.objects.filter(room_id=self.room_id).exists():
            game = ChessGame.objects.get(room_id=self.room_id)
            connected_players, created = ConnectedPlayers.objects.get_or_create(game_id=game)

            user_pk = self.scope['user'].pk

            if user_pk == game.player_white.pk:
                connected_players.white_player_pk = ''
            elif game.player_black.pk:
                connected_players.black_player_pk = ''

            connected_players.save()

            if connected_players.white_player_pk == '' and connected_players.black_player_pk == '':
                game.delete()

    def disconnect(self, code):
        """ Removes user from disconnected websocket """
        self.remove_player_from_connected_players()
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
        self.room_id = None
        self.queue_instance = None
        self.send_enemy_data_task = None

    def connect(self):
        self.user_pk = self.scope['url_route']['kwargs']['user_pk']

        self.room_name = 'queue_room'
        self.room_group_name = self.room_name

        self.accept()

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        if self.player_has_no_active_games():
            self.update_instance()
            self.find_players_pair()

    def player_has_no_active_games(self):
        active_games = ChessGame.objects.filter().all()
        for active_game in active_games:
            if self.user_pk == str(active_game.player_white.pk) or self.user_pk == str(active_game.player_black.pk):
                self.trigger_send_room_id(room_id=active_game.room_id)
        return True

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

    def remove_from_queue(self):
        self.setup_queue_instance()
        queue_list = [int(num) for num in self.queue_instance.users_in_queue.split(',')]
        queue_list.remove(int(self.user_pk))

        self.queue_instance.users_in_queue = ','.join(map(str, queue_list))
        self.queue_instance.save()

    def setup_queue_instance(self):
        if PlayersQueue.objects.all().count() == 0:
            self.queue_instance = PlayersQueue.objects.create()
        else:
            self.queue_instance = PlayersQueue.objects.all().first()

    def find_players_pair(self):
        self.setup_queue_instance()
        queue_list = [int(num) for num in self.queue_instance.users_in_queue.split(',')]
        enemy_players = queue_list.copy()
        enemy_players.remove(int(self.user_pk))

        if len(enemy_players) == 0:
            return False

        self.player_1 = int(self.user_pk)
        self.player_2 = random.choice(enemy_players)
        return True

    def receive(self, text_data):
        data_json = json.loads(text_data)
        if data_json['data_type'] == 'find_opponent':
            if self.find_players_pair():
                self.trigger_send_enemy_data()

    def trigger_send_enemy_data(self):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_enemy_data',
                'player_1': self.player_1,
                'player_2': self.player_2,
            }
        )

    def trigger_send_room_id(self, room_id):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_room_id',
                'active_room_id': room_id
            }
        )

    def send_enemy_data(self, event):
        self.send(text_data=json.dumps({
            'type': 'enemy_data',
            'player_1': event['player_1'],
            'player_2': event['player_2'],
        }))

    def send_room_id(self, event):
        self.send(text_data=json.dumps({
            'type': 'room_id',
            'active_room_id': event['active_room_id'],
        }))

    def disconnect(self, code):
        if self.send_enemy_data_task:
            self.send_enemy_data_task.cancel()
        self.remove_from_queue()

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
