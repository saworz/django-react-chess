from django.shortcuts import render
from rest_framework.generics import CreateAPIView
from .serializers import UserIdSerializer
from .chess_logic import init_board
from rest_framework.response import Response


class CreateNewGameView(CreateAPIView):
    serializer_class = UserIdSerializer

    def create(self, request, *args, **kwargs):
        init_board()
        return Response({"msg": "end"})


