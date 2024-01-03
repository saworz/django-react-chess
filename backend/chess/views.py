import json
import random

from django.shortcuts import render
from rest_framework.generics import CreateAPIView, RetrieveAPIView, UpdateAPIView
from rest_framework.views import APIView
from .serializers import ChessGameSerializer, PlayersQueueSerializer, MakeMoveSerializer, BlackBoardSerializer, WhiteBoardSerializer
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
from django.contrib.auth.models import User
from .models import ChessGame, WhitePieces, BlackPieces, PlayersQueue
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from django.core import serializers


def gametest(request, *args, **kwargs):
    parameters = {'user': request.user.username, 'game_id': kwargs.get("game_id")}
    return render(request, "chess/lobby.html", parameters)


class CreateNewGameView(CreateAPIView):
    serializer_class = ChessGameSerializer

    def create(self, request, *args, **kwargs):
        logged_user = request.user
        try:
            other_user = User.objects.get(pk=kwargs.get("pk"))
        except User.DoesNotExist:
            return JsonResponse({"message": "User with id {} does not exist.".format(kwargs.get("pk"))},
                                status=status.HTTP_404_NOT_FOUND)

        players = [logged_user.pk, other_user.pk]
        random.shuffle(players)

        room_id = ''.join(sorted([str(logged_user.pk), str(other_user.pk)]))

        game_data = {
            "player_white": players[0],
            "player_black": players[1],
            "room_id": room_id
        }

        if ChessGame.objects.filter(room_id=room_id).exists():
            return JsonResponse({"message": "Game for room_id {} already exists".format(room_id)},
                                status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=game_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)


class RetrieveGameIdView(RetrieveAPIView):
    serializer_class = ChessGameSerializer
    queryset = ChessGame.objects.all()

    def get_object(self):
        pk = self.kwargs.get("pk")

        logged_user = self.request.user
        try:
            other_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise NotFound({"message": "User with pk {} does not exist.".format(pk)})

        room_id = ''.join(sorted([str(logged_user.pk), str(other_user.pk)]))
        obj = self.queryset.filter(room_id=room_id).first()

        if obj is None:
            raise NotFound({"message": "Game with room_id {} does not exist.".format(room_id)})
        return obj


class AddUserToQueue(UpdateAPIView):
    queryset = PlayersQueue.objects.all()
    serializer_class = PlayersQueueSerializer

    def is_in_queue(self, queue_instance):
        if queue_instance.users_in_queue:
            queue_list = [int(num) for num in queue_instance.users_in_queue.split(',')]
            if self.request.user.pk in queue_list:
                return True
        return False

    def update(self, request, *args, **kwargs):
        pk = self.request.user.pk

        if self.queryset.count() == 0:
            instance = PlayersQueue.objects.create()
        else:
            instance = self.queryset.first()

        if not instance.users_in_queue:
            update_value = str(pk)
        else:
            update_value = ',' + str(pk)

        if not self.is_in_queue(instance):
            instance.users_in_queue += update_value
            instance.save()
        else:
            return JsonResponse({"message": "User already in queue"}, status=status.HTTP_400_BAD_REQUEST)
        return JsonResponse({"message": "User added to queue"}, status=status.HTTP_200_OK)


class RemoveUserFromQueue(UpdateAPIView):
    queryset = PlayersQueue.objects.all()
    serializer_class = PlayersQueueSerializer

    def is_in_queue(self, queue_instance):
        if queue_instance.users_in_queue:
            queue_list = [int(num) for num in queue_instance.users_in_queue.split(',')]
            if self.request.user.pk in queue_list:
                return True
        return False

    def remove_from_queue(self, queue):
        queue_list = [int(num) for num in queue.split(',')]
        queue_list.remove(self.request.user.pk)
        return ','.join(map(str, queue_list))

    def update(self, request, *args, **kwargs):
        pk = self.request.user.pk
        instance = self.queryset.first()

        if not self.is_in_queue(instance):
            return JsonResponse({"message": "User is not in queue"}, status=status.HTTP_400_BAD_REQUEST)

        instance.users_in_queue = self.remove_from_queue(instance.users_in_queue)
        instance.save()
        return JsonResponse({"message": "User removed from queue"}, status=status.HTTP_200_OK)
