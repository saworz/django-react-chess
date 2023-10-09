from django.shortcuts import render
from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from .serializers import ChessGameSerializer, MakeMoveSerializer, BlackBoardSerializer, WhiteBoardSerializer
from .chess_logic import Game
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

        game_data = {
            "player_white": logged_user.pk,
            "player_black": other_user.pk,
        }

        white_board = {
            "game_id": None,
        }

        black_board = {
            "game_id": None,
        }

        new_game = Game()

        sides = {
            "white": new_game.white_pieces,
            "black": new_game.black_pieces
        }

        for color, board in sides.items():
            for name, piece in board.items():
                piece_info = {
                    "name": name,
                    "position": piece.position,
                    "weight": piece.weight,
                    "possible_moves": piece.possible_moves,
                    "capturing_moves": piece.capturing_moves,
                    "color": piece.color,
                }

                if color == 'white':
                    white_board[name] = piece_info

                elif color == 'black':
                    black_board[name] = piece_info

        serializer = self.get_serializer(data=game_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        white_board["game_id"] = serializer.data["id"]
        black_board["game_id"] = serializer.data["id"]

        white_serializer = WhiteBoardSerializer(data=white_board)
        black_serializer = BlackBoardSerializer(data=black_board)

        print(white_board)
        print(black_board)

        white_serializer.is_valid(raise_exception=True)
        black_serializer.is_valid(raise_exception=True)


        white_serializer.save()
        black_serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MakeMoveView(APIView):
    serializer_class = MakeMoveSerializer

    def post(self, request, *args, **kwargs):
        print(kwargs)
        return JsonResponse({"msg": "makeMove"})
