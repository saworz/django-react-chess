import json
import random

from django.shortcuts import render
from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from .serializers import ChessGameSerializer, MakeMoveSerializer, BlackBoardSerializer, WhiteBoardSerializer
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
from django.contrib.auth.models import User
from .models import ChessGame, WhitePieces, BlackPieces
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

        serializer = self.get_serializer(data=game_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # white_board = {
        #     "game_id": None,
        # }
        #
        # black_board = {
        #     "game_id": None,
        # }
        # sides = {
        #     "white": new_game.white_pieces,
        #     "black": new_game.black_pieces
        # }
        #
        # for color, board in sides.items():
        #     for name, piece in board.items():
        #         piece_info = {
        #             "type": piece.name,
        #             "position": piece.position,
        #             "weight": piece.weight,
        #             "possible_moves": piece.possible_moves,
        #             "capturing_moves": piece.capturing_moves,
        #             "color": piece.color,
        #         }
        #
        #         if color == 'white':
        #             white_board[name] = piece_info
        #
        #         elif color == 'black':
        #             black_board[name] = piece_info
        #
        # white_board["game_id"] = serializer.data["id"]
        # black_board["game_id"] = serializer.data["id"]
        #
        # white_serializer = WhiteBoardSerializer(data=white_board)
        # black_serializer = BlackBoardSerializer(data=black_board)
        #
        # white_serializer.is_valid(raise_exception=True)
        # black_serializer.is_valid(raise_exception=True)
        #
        # white_serializer.save()
        # black_serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)
