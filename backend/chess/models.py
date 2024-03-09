from django.db import models
from django.contrib.auth.models import User
from datetime import timedelta


class PiecesSetup(models.Model):
    pawn_1 = models.JSONField(null=True)
    pawn_2 = models.JSONField(null=True)
    pawn_3 = models.JSONField(null=True)
    pawn_4 = models.JSONField(null=True)
    pawn_5 = models.JSONField(null=True)
    pawn_6 = models.JSONField(null=True)
    pawn_7 = models.JSONField(null=True)
    pawn_8 = models.JSONField(null=True)
    rook_1 = models.JSONField(null=True)
    rook_2 = models.JSONField(null=True)
    bishop_1 = models.JSONField(null=True)
    bishop_2 = models.JSONField(null=True)
    knight_1 = models.JSONField(null=True)
    knight_2 = models.JSONField(null=True)
    queen = models.JSONField(null=True)
    king = models.JSONField(null=True)

    castled = models.BooleanField(default=False, null=True)
    rook_1_moved = models.BooleanField(default=False, null=True)
    rook_2_moved = models.BooleanField(default=False, null=True)
    king_moved = models.BooleanField(default=False, null=True)
    en_passant_field = models.JSONField(null=True)

    class Meta:
        abstract = True


class ChessGame(models.Model):
    player_white = models.ForeignKey(User,
                                     related_name='white_player',
                                     on_delete=models.CASCADE)
    player_black = models.ForeignKey(User,
                                     related_name='black_player',
                                     on_delete=models.CASCADE)
    white_time = models.DurationField(default=timedelta(minutes=10))
    black_time = models.DurationField(default=timedelta(minutes=10))

    waiting_for_first_move = models.BooleanField(default=True)
    last_move = models.DateTimeField(auto_now_add=True)

    white_score = models.IntegerField(default=0)
    black_score = models.IntegerField(default=0)
    white_captures = models.JSONField(null=True)
    black_captures = models.JSONField(null=True)
    current_player = models.CharField(max_length=5, default="white")
    room_id = models.CharField(max_length=5)


class WhitePieces(PiecesSetup):
    game_id = models.ForeignKey(ChessGame, on_delete=models.CASCADE)


class BlackPieces(PiecesSetup):
    game_id = models.ForeignKey(ChessGame, on_delete=models.CASCADE)


class PlayersQueue(models.Model):
    users_in_queue = models.TextField(default='', blank=True)


class ConnectedPlayers(models.Model):
    game_id = models.ForeignKey(ChessGame, on_delete=models.CASCADE)
    white_player = models.ForeignKey(User,
                                     on_delete=models.CASCADE,
                                     related_name="player_white")
    black_player = models.ForeignKey(User,
                                     on_delete=models.CASCADE,
                                     related_name="player_black")
