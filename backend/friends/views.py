from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from django.http import JsonResponse
from .models import FriendRequest
from django.contrib.auth.models import User
from .serializers import FriendsRequestSerializer, CoupledUsersSerializer
from users.serializers import MessageResponseSerializer, LoggedUserSerializer
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.generics import ListAPIView
from users.models import Profile


@extend_schema(
    responses={
        200: OpenApiResponse(response=MessageResponseSerializer, description='Request done'),
    },
)
class UsersView(APIView):
    serializer_class = None

    def get_logged_user(self):
        return self.request.user

    def get_other_user(self):
        pk = self.kwargs.get('pk')
        return User.objects.get(pk=pk)


class SendRequestView(UsersView):

    def post(self, request, *args, **kwargs):
        logged_user = self.get_logged_user()
        other_user = self.get_other_user()

        FriendRequest.objects.get_or_create(from_user=logged_user,
                                            to_user=other_user)

        return JsonResponse({"message": "Request sent"}, status=status.HTTP_200_OK)


class AcceptRequestView(UsersView):

    def post(self, request, *args, **kwargs):
        logged_user = self.get_logged_user()
        other_user = self.get_other_user()

        friend_request = FriendRequest.objects.get(from_user=other_user,
                                                   to_user=logged_user)

        logged_user.profile.friends.add(other_user.profile)
        other_user.profile.friends.add(logged_user.profile)
        friend_request.delete()

        return JsonResponse({"message": "Request accepted"}, status=status.HTTP_200_OK)


class DeclineRequestView(UsersView):

    def post(self, request, *args, **kwargs):
        logged_user = self.get_logged_user()
        other_user = self.get_other_user()

        friend_request = FriendRequest.objects.get(from_user=other_user,
                                                   to_user=logged_user)
        friend_request.delete()

        return JsonResponse({"message": "Request decline"}, status=status.HTTP_200_OK)


class UndoRequestView(UsersView):

    def post(self, request, *args, **kwargs):
        logged_user = self.get_logged_user()
        other_user = self.get_other_user()

        friend_request = FriendRequest.objects.get(from_user=logged_user,
                                                   to_user=other_user)
        friend_request.delete()

        return JsonResponse({"message": "Request undone"}, status=status.HTTP_200_OK)


class RemoveFriendView(UsersView):

    def post(self, request, *args, **kwargs):
        logged_user = self.get_logged_user()
        other_user = self.get_other_user()

        other_user.profile.friends.remove(logged_user.profile)
        logged_user.profile.friends.remove(other_user.profile)

        return JsonResponse({"message": "Friend removed"}, status=status.HTTP_200_OK)


class GetFriendListView(ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = LoggedUserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        filtered_queryset = []

        for profile in queryset:
            if self.request.user.profile in profile.friends.all():
                filtered_queryset.append(profile)

        return filtered_queryset
