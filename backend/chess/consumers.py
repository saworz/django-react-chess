from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import json


class ChessConsumer(WebsocketConsumer):
    def connect(self):
        game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_name = game_id
        self.room_group_name = f"game_{game_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()


    def receive(self, data):
        data_json = json.loads(data)
        action = data_json['action']

        if action == 'make_move':
            piece = data_json['piece']
            color = data_json['color']
            new_position = data_json['new_position']

