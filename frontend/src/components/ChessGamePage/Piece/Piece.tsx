import * as Types from "./Piece.types";
import * as Styles from "./Piece.styles";
import { RootState } from "../../../app/store";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const Piece = ({ file, piece, rank }: Types.IProps) => {
  const { chess } = useSelector((state: RootState) => state.chess);
  const { turn, chessBoard } = chess;
  const currentPosition = chessBoard[chessBoard.length - 1];

  useEffect(() => {
    console.log("Piece position:", rank, file, piece);
  }, []);

  const getMoves = () => {
    const moves: number[][] = [];
    const us = piece[0];
    const enemy = us === "w" ? "b" : "w";

    const direction = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    //rank = x
    //file = y
    direction.forEach((dir) => {
      for (let i = 1; i < 8; i++) {
        const x = rank + i * dir[0];
        const y = file + i * dir[1];

        if (currentPosition?.[x]?.[y] === undefined) {
          break;
        }
        if (currentPosition[x][y].startsWith(enemy)) {
          moves.push([x, y]);
          break;
        }
        if (currentPosition[x][y].startsWith(us)) break;

        moves.push([x, y]);
      }
    });

    return moves;
  };

  const onDragStart = (e: Types.DragEvent) => {
    const target = e.target as HTMLDivElement;

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${piece},${rank},${file}`);
    setTimeout(() => {
      target.style.display = "none";
    }, 0);

    if (turn[0] === piece[0]) {
      const candidateMoves = getMoves();
      console.log(candidateMoves);
    }
  };

  const onDragEnd = (e: Types.DragEvent) => {
    const target = e.target as HTMLDivElement;
    target.style.display = "block";
  };

  return (
    <Styles.Piece
      $piece={piece}
      $file={file}
      $rank={rank}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );
};

export default Piece;
