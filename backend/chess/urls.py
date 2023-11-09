from django.urls import path, include
from django.contrib.auth.decorators import login_required
from . import views


urlpatterns = [
    path('new_game/<int:pk>', login_required(views.CreateNewGameView.as_view())),
    path('get_room_id/<int:pk>', login_required(views.RetrieveGameIdView.as_view())),
    path('game/<str:game_id>', views.gametest)
]
