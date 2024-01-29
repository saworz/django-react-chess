from django.urls import path
from django.contrib.auth.decorators import login_required
from . import views


urlpatterns = [
    path('new_game/<int:pk>', login_required(views.CreateNewGameView.as_view())),
    path('get_room_id/<int:pk>', login_required(views.RetrieveGameIdView.as_view())),
    path('search/add_to_queue', login_required(views.AddUserToQueueView.as_view())),
    path('search/remove_from_queue', login_required(views.RemoveUserFromQueueView.as_view())),
    path('delete_room/<str:room_id>', login_required(views.DeleteRoomView.as_view())),
]
