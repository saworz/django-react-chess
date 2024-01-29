from rest_framework import serializers
from .models import ChessGame, WhitePieces, BlackPieces, PlayersQueue


class ChessGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChessGame
        fields = "__all__"


class WhiteBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhitePieces
        fields = "__all__"


class BlackBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlackPieces
        fields = "__all__"


class MakeMoveSerializer(serializers.Serializer):
    game_id = serializers.CharField(max_length=6)
    color = serializers.CharField(max_length=5)
    piece = serializers.CharField(max_length=8)
    new_position = serializers.CharField(max_length=2)


class PlayersQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayersQueue
        fields = "__all__"


class DeleteRoomSerializer(serializers.Serializer):
    room_id = serializers.CharField(max_length=6)
