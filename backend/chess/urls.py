from django.urls import path, include
from django.contrib.auth.decorators import login_required
from . import views


urlpatterns = [
    path('new_game/<int:pk>', login_required(views.CreateNewGameView.as_view())),
    path('get_room_id/<int:pk>', login_required(views.RetrieveGameIdView.as_view())),
    path('search/add_to_queue', login_required(views.AddUserToQueue.as_view())),
    path('search/remove_from_queue', login_required(views.RemoveUserFromQueue.as_view())),

]
