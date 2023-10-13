from django.db import models
from django.contrib.auth.models import User


class ChatRooms(models.Model):
    room_id = models.CharField(max_length=10)
    user_1 = models.ForeignKey(User, related_name="user_1", on_delete=models.CASCADE)
    user_2 = models.ForeignKey(User, related_name="user_2", on_delete=models.CASCADE)


class Messages(models.Model):
    message = models.CharField(max_length=255)
    chat_room = models.ForeignKey(ChatRooms, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
