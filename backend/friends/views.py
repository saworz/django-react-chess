from django.shortcuts import render
from rest_framework.views import APIView
from django.http import JsonResponse
from .models import FriendRequest
from django.contrib.auth.models import User


class FriendsStatusView(APIView):

    def get(self, request, *args, **kwargs):

        logged_user = request.user
        other_user = User.objects.get(pk=self.kwargs.get('pk'))


        return JsonResponse({"request": self.kwargs, "user_logged": request.user.username})
