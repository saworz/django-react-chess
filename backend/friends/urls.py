from django.urls import path, include
from django.contrib.auth.decorators import login_required
from . import views


urlpatterns = [
    path('send_request/<int:pk>/', login_required(views.SendRequestView.as_view())),
    path('undo_request/<int:pk>/', login_required(views.UndoRequestView.as_view())),
    path('accept_request/<int:pk>/', login_required(views.AcceptRequestView.as_view())),
    path('decline_request/<int:pk>/', login_required(views.DeclineRequestView.as_view())),
    path('remove_friend/<int:pk>/', login_required(views.RemoveFriendView.as_view())),
]
