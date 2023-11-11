import * as Styles from "./Pieces.styles";
import * as Types from "./Pieces.types";
import Piece from "../Piece/Piece";
import Functions from "../../../utils/Functions";
import React, { useRef, useState } from "react";

const Pieces = ({
  isGameStarted,
  piecesPositions,
  setPiecesPositions,
}: Types.IProps) => {
  const [boardPositions, setBoardPositions] = useState(
    Functions.createInitGame(piecesPositions)
  );
  const ref = useRef<HTMLDivElement>(null);

  const calculateCoords = (e: React.MouseEvent) => {
    const { width, left, top } = ref.current!.getBoundingClientRect();
    const size = width / 8;
    const y = Math.floor((e.clientX - left) / size);
    const x = 7 - Math.floor((e.clientY - top) / size);
    return { x, y };
  };

  const onDrop = (e: Types.DragEvent) => {
    const { x, y } = calculateCoords(e); //New
    const [piece, rank, file] = e.dataTransfer.getData("text").split(","); //Old
    console.log("Old", rank, file);
    console.log("New", x, y);
    // const boardAfterMove = Functions.makeMove(
    //   boardPositions,
    //   rank,
    //   file,
    //   x,
    //   y,
    //   piece
    // );
    const newPosition = Functions.copyPosition(boardPositions);
    newPosition[Number(rank)][Number(file)] = "";
    newPosition[x][y] = piece;
    setBoardPositions(newPosition);
  };

  const onDragOver = (e: Types.DragEvent) => {
    e.preventDefault();
  };

  return (
    <Styles.Pieces ref={ref} onDrop={onDrop} onDragOver={onDragOver}>
      {boardPositions.map((r, rank) =>
        r.map((f, file) =>
          boardPositions[rank][file] ? (
            <Piece
              key={rank + "-" + file}
              rank={rank}
              file={file}
              piece={boardPositions[rank][file]}
            />
          ) : null
        )
      )}
    </Styles.Pieces>
  );
};

export default Pieces;
