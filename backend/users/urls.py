from django.urls import path, include
from django.contrib.auth.decorators import login_required
from . import views


urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('login/', views.LoginView.as_view()),
    path('logout/', views.LogoutView.as_view()),

    path('list_profiles/<str:username>/', login_required(views.UsersDataListView.as_view())),
    path('user_data/<int:pk>/', login_required(views.UserDataRetrieveAPIView.as_view())),
    path('update_user/', login_required(views.UserUpdateView.as_view())),
    path('change_password/', login_required(views.UpdatePasswordView.as_view())),

    path('recalculate_elo/<int:winner_pk>/<int:loser_pk>/', login_required(views.RecalculateEloView.as_view())),
]