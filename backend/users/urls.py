from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views


urlpatterns = [
    path('register/', views.register),
    # path('profile/', views.my_profile, name='profile'),
    # path('login/', auth_views.LoginView.as_view()),
    # path('logout/', auth_views.LogoutView.as_view(template_name="users/logout.html"), name='logout'),

]