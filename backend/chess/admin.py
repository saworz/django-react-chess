from django.contrib import admin
from .models import WhitePieces, BlackPieces, ChessGame


admin.site.register(WhitePieces)
admin.site.register(BlackPieces)
admin.site.register(ChessGame)
