from django.urls import path, include
from django.contrib.auth.decorators import login_required
from . import views


urlpatterns = [
    path('get_messages/<str:room_id>/', login_required(views.GetMessagesView.as_view())),
    path('get_room_id/<int:pk>', login_required(views.GetRoomIdView.as_view())),
]
