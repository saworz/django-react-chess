from django.urls import path, include
from django.contrib.auth.decorators import login_required
from . import views


urlpatterns = [
    path('new_game/<int:pk>', login_required(views.CreateNewGameView.as_view())),
    path('make_move/<str:game_id>/<str:color>/<str:piece>/<str:new_position>',
         login_required(views.MakeMoveView.as_view())),
    path('game/<str:game_id>', views.gametest)
]