from django.db import models
from django.contrib.auth.models import User


class PiecesSetup(models.Model):
    pawn_1 = models.JSONField()
    pawn_2 = models.JSONField()
    pawn_3 = models.JSONField()
    pawn_4 = models.JSONField()
    pawn_5 = models.JSONField()
    pawn_6 = models.JSONField()
    pawn_7 = models.JSONField()
    pawn_8 = models.JSONField()
    rook_1 = models.JSONField()
    rook_2 = models.JSONField()
    bishop_1 = models.JSONField()
    bishop_2 = models.JSONField()
    knight_1 = models.JSONField()
    knight_2 = models.JSONField()
    queen = models.JSONField()
    king = models.JSONField()

    class Meta:
        abstract = True


class WhitePieces(PiecesSetup):
    pass


class BlackPieces(PiecesSetup):
    pass


class ChessGame(models.Model):
    player_white = models.ForeignKey(User,
                                     related_name='white_player',
                                     related_query_name='white_player',
                                     on_delete=models.CASCADE)
    player_black = models.ForeignKey(User,
                                     related_name='black_player',
                                     related_query_name='black_player',
                                     on_delete=models.CASCADE)

    # current_player = models.CharField(max_length=5)
    #
    # white_pieces = models.ForeignKey(WhitePieces,
    #                                  related_name='white_pieces',
    #                                  related_query_name='white_pieces',
    #                                  on_delete=models.CASCADE)
    # black_piece = models.ForeignKey(BlackPieces,
    #                                 related_name='black_pieces',
    #                                 related_query_name='black_pieces',
    #                                 on_delete=models.CASCADE)


