from django.shortcuts import render
from rest_framework.views import APIView
from django.http import JsonResponse
from .models import FriendRequest
from django.contrib.auth.models import User


class SendRequestView(APIView):
    pass


class AcceptRequestView(APIView):
    pass


class DeclineRequestView(APIView):
    pass


class UndoRequestView(APIView):
    pass


class RemoveFriendView(APIView):
    pass
