from django.urls import path, include
from . import views


urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    # path('profile/', views.my_profile, name='profile'),
    # path('login/', auth_views.LoginView.as_view()),
    # path('logout/', auth_views.LogoutView.as_view(template_name="users/logout.html"), name='logout'),
]