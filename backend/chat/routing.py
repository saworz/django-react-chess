from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/game_chat/<room_id>', consumers.GameChatConsumer.as_asgi()),
    path('ws/private_chat/<other_user_id>', consumers.PrivateChatConsumer.as_asgi())
]
