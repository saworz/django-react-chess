import json
import random

from django.shortcuts import render
from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from .serializers import ChessGameSerializer, MakeMoveSerializer, BlackBoardSerializer, WhiteBoardSerializer
from .chess_logic import GameInitializer
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
from django.contrib.auth.models import User
from .models import ChessGame, WhitePieces, BlackPieces
from django.shortcuts import get_object_or_404
from django.core import serializers





class MakeMoveView(APIView):
    serializer_class = MakeMoveSerializer

    def string_to_list(self):
        letter = self.kwargs.get("new_position")[0]
        number = self.kwargs.get("new_position")[1]

        x = ord(letter) - ord("A") + 1  # convert B to 2 etc.
        y = int(number)

        return [x, y]

    def move_piece(self, game, chess_pieces):
        piece = getattr(chess_pieces, self.kwargs.get("piece"), None)
        new_position = self.string_to_list()
        old_position = piece["position"]

        for move_set in piece["possible_moves"]:
            if new_position in move_set:
                piece["position"] = new_position
                break
        else:
            return JsonResponse({"message": "Illegal move"}, status=status.HTTP_400_BAD_REQUEST)

        # game.current_player = "white" if game.current_player == "black" else "black"

        game.save()
        chess_pieces.save()

        content = {
            "message": "Changed piece position",
            "new_position": new_position,
            "old_position": old_position,
            # "next_player": game.current_player
        }

        return JsonResponse(content, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=kwargs)
        serializer.is_valid(raise_exception=True)

        game = get_object_or_404(ChessGame, pk=kwargs.get("game_id"))

        if (not (game.current_player == "white" and request.user == game.player_white and kwargs.get("color") == "white")
                and not (game.current_player == "black" and request.user == game.player_black and kwargs.get("color") == "black")):
            return JsonResponse({"message": "Other users turn"}, status=status.HTTP_400_BAD_REQUEST)

        if kwargs.get("color") == "white":
            chess_pieces = get_object_or_404(WhitePieces, pk=kwargs.get("game_id"))
        elif kwargs.get("color") == "black":
            chess_pieces = get_object_or_404(BlackPieces, pk=kwargs.get("game_id"))

        return self.move_piece(game, chess_pieces)


def gametest(request, *args, **kwargs):
    parameters = {'game_id': kwargs.get("game_id")}
    return render(request, "chess/lobby.html", parameters)


# class CreateNewGameView(CreateAPIView):
# #     serializer_class = ChessGameSerializer
# #
# #     def create(self, request, *args, **kwargs):
# #         logged_user = request.user
# #         try:
# #             other_user = User.objects.get(pk=kwargs.get("pk"))
# #         except User.DoesNotExist:
# #             return JsonResponse({"message": "User with id {} does not exist.".format(kwargs.get("pk"))},
# #                                 status=status.HTTP_404_NOT_FOUND)
# #
# #         players = [logged_user.pk, other_user.pk]
# #         random.shuffle(players)
# #
# #         room_id = ''.join(sorted([str(logged_user.pk), str(other_user.pk)]))
# #
# #         game_data = {
# #             "player_white": players[0],
# #             "player_black": players[1],
# #             "room_id": room_id
# #         }
# #
# #         white_board = {
# #             "game_id": None,
# #         }
# #
# #         black_board = {
# #             "game_id": None,
# #         }
# #
# #         new_game = GameInitializer()
# #         new_game.validate_moves()
# #
# #         sides = {
# #             "white": new_game.white_pieces,
# #             "black": new_game.black_pieces
# #         }
# #
# #         for color, board in sides.items():
# #             for name, piece in board.items():
# #                 piece_info = {
# #                     "name": name,
# #                     "position": piece.position,
# #                     "weight": piece.weight,
# #                     "possible_moves": piece.possible_moves,
# #                     "capturing_moves": piece.capturing_moves,
# #                     "color": piece.color,
# #                 }
# #
# #                 if color == 'white':
# #                     white_board[name] = piece_info
# #
# #                 elif color == 'black':
# #                     black_board[name] = piece_info
# #
# #         serializer = self.get_serializer(data=game_data)
# #         serializer.is_valid(raise_exception=True)
# #         self.perform_create(serializer)
# #
# #         white_board["game_id"] = serializer.data["id"]
# #         black_board["game_id"] = serializer.data["id"]
# #
# #         white_serializer = WhiteBoardSerializer(data=white_board)
# #         black_serializer = BlackBoardSerializer(data=black_board)
# #
# #         white_serializer.is_valid(raise_exception=True)
# #         black_serializer.is_valid(raise_exception=True)
# #
# #         white_serializer.save()
# #         black_serializer.save()
# #
# #         return Response(serializer.data, status=status.HTTP_201_CREATED)