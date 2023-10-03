from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, ListAPIView, UpdateAPIView
from rest_framework import status
from .serializers import (UserRegisterFormSerializer, UserErrorResponseSerializer,
                          UserLoginSerializer, UserDataDictSerializer, MessageResponseSerializer, LoggedUserSerializer,
                          UsersListSerializer, OtherUserSerializer, UpdateUserSerializer)

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter, OpenApiExample
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login, logout
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.contrib.auth.models import User
from .models import Profile
from rest_framework.exceptions import ValidationError
from django.contrib.auth.decorators import login_required
from .forms import ProfileUpdateForm
from rest_framework.response import Response
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from rest_framework.parsers import MultiPartParser


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    serializer_class = UserRegisterFormSerializer

    @extend_schema(
        responses={
            201: OpenApiResponse(response=MessageResponseSerializer, description='User created'),
            400: OpenApiResponse(response=UserErrorResponseSerializer, description='Bad request'),
        },
    )
    def post(self, request) -> JsonResponse:
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            form = serializer.save()
            if form.is_valid():
                form.save()
                return JsonResponse({"message": "Registration successful."}, status=status.HTTP_201_CREATED)
            errors = self.get_errors(form.errors)
        else:
            errors = self.get_errors(serializer.errors)
        return JsonResponse({"message": "Registration failed.", "errors": errors},
                            status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def reformat_error(error: str) -> str:
        min_length = 8
        return error % {'min_length': min_length}

    def get_errors(self, form_errors: dict) -> dict:
        errors_dict = {}
        for field, errors in form_errors.items():
            for error in errors:
                if '%(min_length)d' in error:
                    errors_dict[str(field)] = self.reformat_error(error)
                else:
                    errors_dict[str(field)] = error
        return errors_dict


class LoginView(APIView):
    serializer_class = UserLoginSerializer

    @extend_schema(
        responses={
            200: OpenApiResponse(response=UserDataDictSerializer, description='User logged in'),
            400: OpenApiResponse(response=MessageResponseSerializer, description='Bad request'),
            401: OpenApiResponse(response=MessageResponseSerializer, description='Wrong credentials'),
        },
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            validated_data = serializer.validated_data
            user = authenticate(username=validated_data['username'], password=validated_data['password'])

            if user is not None:
                user_data = {"id": user.pk,
                             "username": user.username,
                             "email": user.email,
                             "image_url": request.build_absolute_uri(user.profile.image.url)}

                login(request, user)
                jwt_access_token = str(AccessToken.for_user(user))
                jwt_refresh_token = str(RefreshToken.for_user(user))

                return JsonResponse({"message": "Login successful", "user": user_data,
                                     "jwt_access_token": jwt_access_token, "jwt_refresh_token": jwt_refresh_token},
                                    status=status.HTTP_200_OK)

            return JsonResponse({"message": "Invalid username or password"},
                                status=status.HTTP_401_UNAUTHORIZED)
        return JsonResponse({"message": "Missing username or password"}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Request body:
    - No request data is expected for this endpoint.
    """
    serializer_class = None

    @extend_schema(
        responses={
            200: OpenApiResponse(response=MessageResponseSerializer, description='User logged out'),
        },
    )
    def post(self, request):
        logout(request)
        return JsonResponse({"message": "User logged out"}, status=status.HTTP_200_OK)


@extend_schema(
    responses={
        200: OpenApiResponse(response=OtherUserSerializer, description='Retrieved user data'),
        400: OpenApiResponse(response=MessageResponseSerializer, description='Incorrect or empty query parameter'),
    },
)
class UserDataRetrieveAPIView(RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = OtherUserSerializer


@extend_schema(
    responses={
        200: OpenApiResponse(response=UsersListSerializer, description='Retrieved users list'),
        400: OpenApiResponse(response=MessageResponseSerializer, description='Incorrect or empty query parameter'),
    },
)
class UsersDataListView(ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = UsersListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        partial_string = self.kwargs.get('username')

        if not partial_string:
            raise ValidationError("Incorrect or empty query parameter")

        queryset = queryset.filter(user__username__icontains=partial_string)
        new_queryset = []

        for profile in queryset:
            if self.request.user.profile != User.objects.get(pk=profile.pk).profile:
                new_queryset.append(profile)

        return new_queryset


class UserUpdateView(UpdateAPIView):
    serializer_class = UpdateUserSerializer
    parser_classes = [MultiPartParser]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        user = self.get_object()

        if 'username' in self.request.data:
            new_username = self.request.data['username']
            if User.objects.filter(username=new_username).exclude(username=self.request.user.username).exists():
                error_message = {'message': ['Username already exists.']}
                raise ValidationError(detail=error_message)

            user.username = new_username

        if 'email' in self.request.data:
            new_email = self.request.data['email']
            if User.objects.filter(email=new_email).exclude(email=self.request.user.email).exists():
                error_message = {'message': ['Email already exists.']}
                raise ValidationError(detail=error_message)

            user.email = new_email

        if 'image' in self.request.data:
            user.profile.image = self.request.data['image']

        user.save()
        user.profile.save()
