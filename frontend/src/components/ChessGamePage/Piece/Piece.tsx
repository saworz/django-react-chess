import * as Types from "./Piece.types";
import * as Styles from "./Piece.styles";
import { AppDispatch, RootState } from "../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import arbiter from "../../../arbiter/arbiter";
import { generateCandidateMoves } from "../../../features/chess/chessSlice";

const Piece = ({ file, piece, rank }: Types.IProps) => {
  const { chess } = useSelector((state: RootState) => state.chess);
  const dispatch: AppDispatch = useDispatch();
  const { turn, chessBoard } = chess;
  const currentPosition = chessBoard;

  const onDragStart = (e: Types.DragEvent) => {
    const target = e.target as HTMLDivElement;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${piece},${rank},${file}`);
    setTimeout(() => {
      target.style.display = "none";
    }, 0);

    if (turn[0] === piece[0]) {
      const candidateMoves = arbiter.getRegularMoves({
        position: currentPosition,
        piece,
        file,
        rank,
      });
      console.log("possible moves", candidateMoves);
      dispatch(generateCandidateMoves(candidateMoves));
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
      className={`${piece} position: ${file}${rank}`}
    />
  );
};

export default Piece;
