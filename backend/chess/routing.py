from django.urls import path, re_path
from . import consumers

websocket_urlpatterns = [
    path('ws/chess/<room_id>', consumers.ChessConsumer.as_asgi())
]
