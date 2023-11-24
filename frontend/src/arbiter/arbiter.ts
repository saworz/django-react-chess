import { getRookMoves } from "./getMoves";

interface IGetRookMoves {
  position: string[][];
  piece: string;
  rank: number;
  file: number;
}

const arbiter = {
  getRegularMoves: function ({ position, piece, rank, file }: IGetRookMoves) {
    return getRookMoves({ position, piece, rank, file });
  },
};

export default arbiter;
