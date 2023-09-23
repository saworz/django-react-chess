from django.urls import path, include
from django.contrib.auth.decorators import login_required
from . import views


urlpatterns = [
    path('is_friend/<int:pk>/', login_required(views.FriendsStatusView.as_view())),
]
