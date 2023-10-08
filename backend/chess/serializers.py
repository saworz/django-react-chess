from rest_framework import serializers
from .models import ChessGame


class ChessGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChessGame
        fields = "__all__"


class MakeMoveSerializer(serializers.Serializer):
    game_id = serializers.HyperlinkedRelatedField(
        view_name='game_id',
        read_only=True
    )
    color = serializers.HyperlinkedRelatedField(
        view_name='color',
        read_only=True,
    )
    piece = serializers.HyperlinkedRelatedField(
        view_name='piece',
        read_only=True
    )
    new_position = serializers.HyperlinkedRelatedField(
        view_name='new_position',
        read_only=True
    )
