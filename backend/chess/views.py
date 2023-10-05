from django.shortcuts import render
from rest_framework.generics import CreateAPIView, ListApiView
from .serializers import UserIdSerializer


class CreateNewGameView(CreateAPIView):
    serializer_class = UserIdSerializer

