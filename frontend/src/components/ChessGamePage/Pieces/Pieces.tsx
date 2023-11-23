import * as Styles from "./Pieces.styles";
import * as Types from "./Pieces.types";
import Piece from "../Piece/Piece";
import Functions from "../../../utils/Functions";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { makeMove, initGame } from "../../../features/chess/chessSlice";

const Pieces = () => {
  const dispatch: AppDispatch = useDispatch();
  const { chess } = useSelector((state: RootState) => state.chess);

  useEffect(() => {
    dispatch(initGame(Functions.createInitGame(chess.piecesPosition)));
  }, [chess.piecesPosition, dispatch]);

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

    const newPosition = Functions.copyPosition(chess.chessBoard);
    newPosition[Number(rank)][Number(file)] = "";
    newPosition[x][y] = piece;

    const nextTurn = chess.turn === "white" ? "black" : "white";

    dispatch(makeMove({ newPosition, nextTurn }));
  };

  const onDragOver = (e: Types.DragEvent) => {
    e.preventDefault();
  };

  return (
    <Styles.Pieces ref={ref} onDrop={onDrop} onDragOver={onDragOver}>
      {chess.chessBoard.map((f, file) =>
        f.map((r, rank) =>
          chess.chessBoard[rank][file] ? (
            <Piece
              key={rank + "-" + file}
              rank={rank}
              file={file}
              piece={chess.chessBoard[rank][file]}
            />
          ) : null
        )
      )}
    </Styles.Pieces>
  );
};

export default Pieces;
