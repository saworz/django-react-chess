from django.urls import path, include
from django.contrib.auth.decorators import login_required
from . import views


urlpatterns = [
    path('send_message/<int:pk>/', login_required(views.SendMessageView.as_view())),
    path('get_messages/<int:pk>/', login_required(views.GetMessagesView.as_view())),
]
