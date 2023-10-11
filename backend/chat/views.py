from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import MessagesSerializer, GetMessageSerializer
from django.http import JsonResponse, HttpResponse
from rest_framework import status
from rest_framework.generics import ListAPIView
from .models import Messages
from django.contrib.auth.models import User
from itertools import chain


class SendMessageView(APIView):
    serializer_class = MessagesSerializer

    def post(self, request, pk):
        serializer = self.serializer_class(data=request.data, context={'pk': pk})

        if serializer.is_valid():
            serializer.save(logged_user=self.request.user)
            return JsonResponse(data={"message": "Message saved"}, status=status.HTTP_200_OK)
        return JsonResponse(data={"message": "Bad request"}, status=status.HTTP_400_BAD_REQUEST)


class GetMessagesView(ListAPIView):
    serializer_class = GetMessageSerializer

    def get_queryset(self):
        receiver_id = self.kwargs['pk']
        sent = Messages.objects.filter(from_user=self.request.user, to_user=User.objects.get(pk=receiver_id))
        received = Messages.objects.filter(from_user=User.objects.get(pk=receiver_id), to_user=self.request.user)
        all_messages = sent.union(received)
        return all_messages.order_by("-timestamp")


def room(request, room_name):
    return HttpResponse(room_name)
