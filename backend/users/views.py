from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, ListAPIView, UpdateAPIView
from rest_framework import status
from .serializers import (UserRegisterFormSerializer, UserErrorResponseSerializer,
                          UserLoginSerializer, UserDataDictSerializer, MessageResponseSerializer,
                          UsersListSerializer, OtherUserSerializer, UpdateUserSerializer, ChangePasswordSerializer,
                          ProfileSerializer)

from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login, logout
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.contrib.auth.models import User
from .models import Profile
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import update_session_auth_hash


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    """
    Register new user
    """
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


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """
    Log in to existing account
    """
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
                             "image": request.build_absolute_uri(user.profile.image.url)}

                login(request, user)
                jwt_access_token = str(AccessToken.for_user(user))
                jwt_refresh_token = str(RefreshToken.for_user(user))

                return JsonResponse({"message": "Login successful", "user": user_data,
                                     "jwt_access_token": jwt_access_token, "jwt_refresh_token": jwt_refresh_token},
                                    status=status.HTTP_200_OK)

            return JsonResponse({"message": "Invalid username or password"},
                                status=status.HTTP_401_UNAUTHORIZED)
        return JsonResponse({"message": "Missing username or password"}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
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
    """
    Get informations for user with specified ID
    """
    queryset = Profile.objects.all()
    serializer_class = OtherUserSerializer


@extend_schema(
    responses={
        200: OpenApiResponse(response=UsersListSerializer, description='Retrieved users list'),
        400: OpenApiResponse(response=MessageResponseSerializer, description='Incorrect or empty query parameter'),
    },
)
class UsersDataListView(ListAPIView):
    """
    Lists users data for profiles that contain specified username
    """
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


@extend_schema(
    responses={
        200: OpenApiResponse(response=UpdateUserSerializer, description='User data have been updated'),
        400: OpenApiResponse(response=MessageResponseSerializer, description='Incorrect data'),
    },
)
class UserUpdateView(UpdateAPIView):
    """
    Update user data such as username, email or profile image
    """
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


@extend_schema(
    responses={
        200: OpenApiResponse(response=MessageResponseSerializer, description='Password updated'),
        400: OpenApiResponse(response=MessageResponseSerializer, description='Incorrect data'),
    },
)
class UpdatePasswordView(UpdateAPIView):
    """
    Endpoint for updating user password
    """
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = (IsAuthenticated,)

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            if not user.check_password(serializer.data.get("old_password")):
                return JsonResponse({"message": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)

            if serializer.data.get("new_password") != serializer.data.get("repeated_password"):
                return JsonResponse({"message": "New passwords dont match"}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.data.get("new_password"))
            user.save()
            update_session_auth_hash(request, user)

        return JsonResponse({"message": "Password changed"}, status=status.HTTP_200_OK)


@extend_schema(request=None)
class RecalculateEloView(UpdateAPIView):
    """
    Calculate user's new ELO rating after the game
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_object(self, winner_pk, loser_pk):
        winner_instance = Profile.objects.get(pk=winner_pk)
        loser_instance = Profile.objects.get(pk=loser_pk)
        return winner_instance, loser_instance

    @staticmethod
    def get_win_probability(player, enemy):
        return 1 / (1 + 10 ** round((enemy.elo - player.elo) / 400))

    @staticmethod
    def get_new_ratings(elo, score, expected_score):
        return round(elo + 32 * (score - expected_score))

    def calculate_elo(self, white_player, black_player, game_outcome):
        white_win_probability = self.get_win_probability(white_player, black_player)

        if game_outcome == 0:
            white_player_new_elo = self.get_new_ratings(white_player.elo, 0.5, white_win_probability)
            black_player_new_elo = self.get_new_ratings(black_player.elo, 0.5, 1-white_win_probability)
        elif game_outcome == 1:
            white_player_new_elo = self.get_new_ratings(white_player.elo, 1, white_win_probability)
            black_player_new_elo = self.get_new_ratings(black_player.elo, 0, 1-white_win_probability)
            white_player.wins += 1
            black_player.losses += 1
        elif game_outcome == 2:
            white_player_new_elo = self.get_new_ratings(white_player.elo, 0, white_win_probability)
            black_player_new_elo = self.get_new_ratings(black_player.elo, 1, 1-white_win_probability)
            white_player.losses += 1
            black_player.wins += 1

        white_player_elo_gain = white_player_new_elo - white_player.elo
        black_player_elo_gain = black_player_new_elo - black_player.elo

        white_player.elo = white_player_new_elo
        black_player.elo = black_player_new_elo

        return white_player_elo_gain, black_player_elo_gain

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        white_player_instance, black_player_instance = self.get_object(kwargs['white_player_pk'], kwargs['black_player_pk'])
        game_outcome = kwargs['game_outcome']
        white_player_elo_gain, black_player_elo_gain = self.calculate_elo(white_player_instance, black_player_instance, game_outcome)

        white_player_serializer = self.get_serializer(white_player_instance, data=request.data, partial=partial)
        black_player_serializer = self.get_serializer(black_player_instance, data=request.data, partial=partial)

        white_player_serializer.is_valid(raise_exception=True)
        black_player_serializer.is_valid(raise_exception=True)

        self.perform_update(white_player_serializer)
        self.perform_update(black_player_serializer)

        return JsonResponse(
            data={
                'white_elo_difference': white_player_elo_gain,
                'black_elo_difference': black_player_elo_gain,
                'white_player_data': white_player_serializer.data,
                'black_player_data': black_player_serializer.data
            }, status=status.HTTP_200_OK)


class LeaderboardListView(ListAPIView):
    queryset = Profile.objects.all().order_by("-elo")
    serializer_class = UsersListSerializer
