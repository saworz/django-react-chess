from django.urls import path, include
from django.contrib.auth.decorators import login_required
from . import views


urlpatterns = [
    path('new_game/<int:pk>', login_required(views.CreateNewGameView.as_view())),
    # path('make_move/<str:game_id>/<str:color>/<str:piece>/<str:new_position>',
    #      login_required(views.MakeMoveView.as_view())),
    path('game/<str:game_id>', views.gametest)
]

#         self.pawn_1 = PiecePawn("pawn", (1, 2), 1, "white")
#         self.pawn_2 = PiecePawn("pawn", (2, 2), 1, "white")
#         self.pawn_3 = PiecePawn("pawn", (3, 2), 1, "white")
#         self.pawn_4 = PiecePawn("pawn", (4, 2), 1, "white")
#         self.pawn_5 = PiecePawn("pawn", (5, 2), 1, "white")
#         self.pawn_6 = PiecePawn("pawn", (6, 2), 1, "white")
#         self.pawn_7 = PiecePawn("pawn", (7, 2), 1, "white")
#         self.pawn_8 = PiecePawn("pawn", (8, 2), 1, "white")
#         self.rook_1 = PieceRook("rook", (1, 1), 5, "white")
#         self.rook_2 = PieceRook("rook", (8, 1), 5, "white")
#         self.bishop_1 = PieceBishop("bishop", (3, 1), 3, "white")
#         self.bishop_2 = PieceBishop("bishop", (6, 1), 3, "white")
#         self.knight_1 = PieceKnight("knight", (2, 1), 3, "white")
#         self.knight_2 = PieceKnight("knight", (7, 1), 3, "white")
#         self.queen_1 = PieceQueen("queen", (5, 1), 9, "white")
#         self.king_1 = PieceKing("king", (4, 1), 0, "white")

#         self.pawn_9 = PiecePawn("pawn", (1, 7), 1, "black")
#         self.pawn_10 = PiecePawn("pawn", (2, 7), 1, "black")
#         self.pawn_11 = PiecePawn("pawn", (3, 7), 1, "black")
#         self.pawn_12 = PiecePawn("pawn", (4, 7), 1, "black")
#         self.pawn_13 = PiecePawn("pawn", (5, 7), 1, "black")
#         self.pawn_14 = PiecePawn("pawn", (6, 7), 1, "black")
#         self.pawn_15 = PiecePawn("pawn", (7, 7), 1, "black")
#         self.pawn_16 = PiecePawn("pawn", (8, 7), 1, "black")
#         self.rook_3 = PieceRook("rook", (1, 8), 5, "black")
#         self.rook_4 = PieceRook("rook", (8, 8), 5, "black")
#         self.bishop_3 = PieceBishop("bishop", (3, 8), 3, "black")
#         self.bishop_4 = PieceBishop("bishop", (6, 8), 3, "black")
#         self.knight_3 = PieceKnight("knight", (2, 8), 3, "black")
#         self.knight_4 = PieceKnight("knight", (7, 8), 3, "black")
#         self.queen_2 = PieceQueen("queen", (4, 8), 9, "black")
#         self.king_2 = PieceKing("king", (5, 8), 0, "black")