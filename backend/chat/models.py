from django.db import models
from django.contrib.auth.models import User


class Messages(models.Model):
    message = models.CharField(max_length=255)
    from_user = models.ForeignKey(User, related_name="sender", on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name="receiver", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
