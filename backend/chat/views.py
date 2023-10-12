from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import MessagesSerializer, GetMessageSerializer, RoomIdSerializer
from django.http import JsonResponse, HttpResponse
from rest_framework import status
from rest_framework.generics import ListAPIView
from .models import Messages, ChatRooms
from django.contrib.auth.models import User
from itertools import chain
from django.shortcuts import get_object_or_404
from django.db.models import Q


class SendMessageView(APIView):
    serializer_class = MessagesSerializer

    def post(self, request, pk):
        serializer = self.serializer_class(data=request.data, context={'pk': pk})

        if serializer.is_valid():
            serializer.save(logged_user=self.request.user)
            return JsonResponse(data={"message": "Message saved"}, status=status.HTTP_200_OK)
        return JsonResponse(data={"message": "Bad request"}, status=status.HTTP_400_BAD_REQUEST)


class GetMessagesView(ListAPIView):
    serializer_class = GetMessageSerializer

    def get_queryset(self):
        receiver_id = self.kwargs['pk']
        sent = Messages.objects.filter(from_user=self.request.user, to_user=User.objects.get(pk=receiver_id))
        received = Messages.objects.filter(from_user=User.objects.get(pk=receiver_id), to_user=self.request.user)
        all_messages = sent.union(received)
        return all_messages.order_by("-timestamp")


class GetRoomIdView(APIView):
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


def room(request, room_id):
    return render(request, 'chat/lobby.html', {'room_id': room_id})
