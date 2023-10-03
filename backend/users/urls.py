from django.urls import path, include
from django.contrib.auth.decorators import login_required
from . import views


urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('login/', views.LoginView.as_view()),
    path('logout/', views.LogoutView.as_view()),

    path('list_profiles/<str:username>/', login_required(views.UsersDataListView.as_view())),
    path('user_data/<int:pk>/', login_required(views.UserDataRetrieveAPIView.as_view())),
]