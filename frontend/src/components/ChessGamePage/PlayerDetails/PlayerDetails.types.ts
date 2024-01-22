export interface IProps {
  image: string;
  username: string;
  playerDetails: { piecesCaptured: string[]; points: number | null };
}

export interface IPieceProps {
  $piece: string;
}
