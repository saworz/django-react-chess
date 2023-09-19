from django.urls import path, include
from . import views


urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view()),
    # path('profile/', views.my_profile, name='profile'),
    # path('logout/', auth_views.LogoutView.as_view(template_name="users/logout.html"), name='logout'),
]