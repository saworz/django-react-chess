import {
  getBishopMoves,
  getKingMoves,
  getKnightMoves,
  getPawnCaptures,
  getPawnMoves,
  getQueenMoves,
  getRookMoves,
} from "./getMoves";

interface IGetMoves {
  position: string[][];
  piece: string;
  rank: number;
  file: number;
}

const arbiter = {
  getRegularMoves: function ({ position, piece, rank, file }: IGetMoves) {
    if (piece.endsWith("rook")) {
      return getRookMoves({ position, piece, rank, file });
    }
    if (piece.endsWith("knight")) {
      return getKnightMoves({ position, piece, rank, file });
    }
    if (piece.endsWith("bishop")) {
      return getBishopMoves({ position, piece, rank, file });
    }
    if (piece.endsWith("queen")) {
      return getQueenMoves({ position, piece, rank, file });
    }
    if (piece.endsWith("king")) {
      return getKingMoves({ position, piece, rank, file });
    }
    if (piece.endsWith("pawn")) {
      return [
        ...getPawnMoves({ position, piece, rank, file }),
        ...getPawnCaptures({ position, piece, rank, file }),
      ];
    }
  },
};

export default arbiter;
