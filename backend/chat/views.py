from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.views import APIView
from .serializers import RoomIdSerializer, GetMessagesSerializer
from django.http import JsonResponse
from rest_framework import status
from rest_framework.generics import ListAPIView
from .models import Messages, ChatRooms
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .serializers import MessageResponseSerializer


@extend_schema(
    responses={
        200: OpenApiResponse(response=GetMessagesSerializer, description='Returns list of messages'),
        400: OpenApiResponse(response=MessageResponseSerializer, description='Incorrect or empty query parameter'),
    },
)
class GetMessagesView(ListAPIView):
    """
    Return list of all messages sorted by time sent
    """
    serializer_class = GetMessagesSerializer

    def get_queryset(self):
        room_id = self.kwargs['room_id']
        chat_room = ChatRooms.objects.get(room_id=room_id)
        messages = Messages.objects.filter(chat_room=chat_room.pk)
        return messages.order_by("-timestamp")


@extend_schema(
    responses={
        200: OpenApiResponse(response=RoomIdSerializer, description='Returns room_id'),
        400: OpenApiResponse(response=MessageResponseSerializer, description='Incorrect or empty query parameter'),
    },
)
class GetRoomIdView(APIView):
    """
    Returns room_id based on currently logged player and enemy
    room_id is sorted and concatenated ids of two players e.g.: player1.id = 23, player2.id = 19 => room_id = 1923
    """
    serializer_class = RoomIdSerializer

    def get(self, request, *args, **kwargs):
        logged_user = self.request.user
        other_user = get_object_or_404(User, pk=kwargs['pk'])

        if logged_user == other_user:
            return JsonResponse({"message": "User id same for logged user"}, status=status.HTTP_400_BAD_REQUEST)

        chat_room = ChatRooms.objects.filter(Q(user_1=logged_user.pk, user_2=other_user.pk)
                                             | Q(user_1=other_user.pk, user_2=logged_user.pk))

        if len(chat_room) == 0:
            room_id = ''.join(map(str, sorted([other_user.pk, logged_user.pk])))
            ChatRooms.objects.create(room_id=room_id, user_1=logged_user, user_2=other_user)
        else:
            room_id = chat_room.first().room_id

        return JsonResponse({"room_id": room_id}, status=status.HTTP_200_OK)
