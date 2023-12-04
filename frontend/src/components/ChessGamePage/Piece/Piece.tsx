import * as Types from "./Piece.types";
import * as Styles from "./Piece.styles";
import { AppDispatch, RootState } from "../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import {
  generateCandidateMoves,
  setSelectedPiece,
} from "../../../features/chess/chessSlice";

const Piece = ({ file, piece, rank }: Types.IProps) => {
  const { chess } = useSelector((state: RootState) => state.chess);
  const dispatch: AppDispatch = useDispatch();
  const { current_player, piecesPosition } = chess;
  let selectedPiece = null;

  const onDragStart = (e: Types.DragEvent) => {
    const pieceColor = piece[0];

    const target = e.target as HTMLDivElement;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${piece},${rank},${file}`);
    setTimeout(() => {
      target.style.display = "none";
    }, 0);

    if (pieceColor === "w") {
      selectedPiece = piecesPosition.white_pieces.filter(
        (piece) =>
          piece.position[0] === file + 1 && piece.position[1] === rank + 1
      )[0];
      dispatch(setSelectedPiece(selectedPiece));
    } else {
      selectedPiece = piecesPosition.black_pieces.filter(
        (piece) =>
          piece.position[0] === file + 1 && piece.position[1] === rank + 1
      )[0];
      dispatch(setSelectedPiece(selectedPiece));
    }

    if (current_player[0] === piece[0]) {
      const candidateMoves = [
        ...selectedPiece?.possible_moves,
        selectedPiece?.capturing_moves,
      ]
        .flat()
        .map((pos) => [pos[1] - 1, pos[0] - 1]);
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
