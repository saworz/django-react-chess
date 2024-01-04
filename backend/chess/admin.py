from django.contrib import admin
from .models import WhitePieces, BlackPieces, ChessGame, PlayersQueue


admin.site.register(WhitePieces)
admin.site.register(BlackPieces)
admin.site.register(ChessGame)
admin.site.register(PlayersQueue)
