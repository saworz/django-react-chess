from django.shortcuts import render
from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from .serializers import ChessGameSerializer, MakeMoveSerializer
from .chess_logic import init_board
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
from django.contrib.auth.models import User


class CreateNewGameView(CreateAPIView):
    serializer_class = ChessGameSerializer

    def create(self, request, *args, **kwargs):
        logged_user = request.user
        try:
            other_user = User.objects.get(pk=kwargs.get("pk"))
        except User.DoesNotExist:
            return JsonResponse({"message": "User with id {} does not exist.".format(kwargs.get("pk"))},
                                status=status.HTTP_404_NOT_FOUND)

        players = {
            "player_white": logged_user.pk,
            "player_black": other_user.pk
        }

        serializer = self.get_serializer(data=players)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MakeMoveView(APIView):
    serializer_class = MakeMoveSerializer

    def post(self, request, *args, **kwargs):
        print(kwargs)
        return JsonResponse({"msg": "makeMove"})
