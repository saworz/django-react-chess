from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # path(r'^ws/chat/(?P<room_id>[^/]+)/$', consumers.ChatConsumer.as_asgi())
    path('ws/chat/<room_id>', consumers.ChatConsumer.as_asgi())
]
