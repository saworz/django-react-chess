from rest_framework.views import APIView
from django.http import JsonResponse
from .models import FriendRequest
from django.contrib.auth.models import User
from users.serializers import MessageResponseSerializer, LoggedUserSerializer
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.generics import ListAPIView
from users.models import Profile
from django.shortcuts import get_object_or_404

@extend_schema(
    responses={
        200: OpenApiResponse(response=MessageResponseSerializer, description='Request done'),
    },
)
class UsersView(APIView):
    """
    Base parent class for handling friend requests
    """
    serializer_class = None

    def get_logged_user(self):
        return self.request.user

    def get_other_user(self):
        pk = self.kwargs.get('pk')
        return User.objects.get(pk=pk)


class SendRequestView(UsersView):
    """
    Sends a friend request
    """
    def post(self, request, *args, **kwargs):
        logged_user = self.get_logged_user()
        other_user = self.get_other_user()

        FriendRequest.objects.get_or_create(from_user=logged_user,
                                            to_user=other_user)

        return JsonResponse({"message": "Request sent"}, status=status.HTTP_200_OK)


class AcceptRequestView(UsersView):
    """
    Accepts a friend request
    """
    def post(self, request, *args, **kwargs):
        logged_user = self.get_logged_user()
        other_user = self.get_other_user()

        friend_request = get_object_or_404(FriendRequest,
                                           from_user=other_user,
                                           to_user=logged_user)

        logged_user.profile.friends.add(other_user.profile)
        other_user.profile.friends.add(logged_user.profile)
        friend_request.delete()

        return JsonResponse({"message": "Request accepted"}, status=status.HTTP_200_OK)


class DeclineRequestView(UsersView):
    """
    Declines a friend request
    """
    def delete(self, request, *args, **kwargs):
        logged_user = self.get_logged_user()
        other_user = self.get_other_user()

        friend_request = get_object_or_404(FriendRequest,
                                           from_user=other_user,
                                           to_user=logged_user)
        friend_request.delete()

        return JsonResponse({"message": "Request decline"}, status=status.HTTP_200_OK)


class UndoRequestView(UsersView):
    """
    Undoes a friend request
    """
    def delete(self, request, *args, **kwargs):
        logged_user = self.get_logged_user()
        other_user = self.get_other_user()

        friend_request = get_object_or_404(FriendRequest,
                                           from_user=logged_user,
                                           to_user=other_user)
        friend_request.delete()

        return JsonResponse({"message": "Request undone"}, status=status.HTTP_200_OK)


class RemoveFriendView(UsersView):
    """
    Removes a friend from friend list
    """
    def delete(self, request, *args, **kwargs):
        logged_user = self.get_logged_user()
        other_user = self.get_other_user()

        other_user.profile.friends.remove(logged_user.profile)
        logged_user.profile.friends.remove(other_user.profile)

        return JsonResponse({"message": "Friend removed"}, status=status.HTTP_200_OK)


class GetFriendListView(ListAPIView):
    """
    Returns a list of friends
    """
    serializer_class = LoggedUserSerializer

    def get_queryset(self):
        profiles = Profile.objects.all()

        filtered_data = []
        for profile in profiles:
            if profile in self.request.user.profile.friends.all():
                filtered_data.append(profile)

        return filtered_data


class GetPendingRequestsListView(ListAPIView):
    """
    Gets list of pending friend requests
    """
    serializer_class = LoggedUserSerializer

    def get_queryset(self):
        profiles = Profile.objects.all()

        filtered_data = []
        for profile in profiles:
            user_instance = profile.user

            try:
                FriendRequest.objects.get(from_user=user_instance, to_user=self.request.user)
                filtered_data.append(profile)
            except FriendRequest.DoesNotExist:
                pass

        return filtered_data


class GetSentRequestsListView(ListAPIView):
    """
    Gets list of sent friend requests
    """
    serializer_class = LoggedUserSerializer

    def get_queryset(self):
        profiles = Profile.objects.all()
        filtered_data = []

        for profile in profiles:
            user_instance = profile.user

            try:
                FriendRequest.objects.get(from_user=self.request.user, to_user=user_instance)
                filtered_data.append(profile)
            except FriendRequest.DoesNotExist:
                pass

        return filtered_data
