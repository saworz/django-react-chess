import * as Types from "./Piece.types";
import * as Styles from "./Piece.styles";
import { AppDispatch, RootState } from "../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import {
  generateCandidateMoves,
  setSelectedPiece,
} from "../../../features/chess/chessSlice";
import * as SharedTypes from "../../../shared/types";
import { Status } from "../../../constants";
import Functions from "../../../utils/Functions";

const Piece = ({ file, piece, rank }: Types.IProps) => {
  const { chess } = useSelector((state: RootState) => state.chess);
  const dispatch: AppDispatch = useDispatch();
  const {
    current_player,
    copyPiecesPosition,
    black_long_castle_legal,
    black_short_castle_legal,
    white_long_castle_legal,
    white_short_castle_legal,
  } = chess;
  const isGameEnded = chess.gameStatus === Status.ongoing ? false : true;
  const isBlackCastleLegal =
    black_long_castle_legal || black_short_castle_legal;
  const isWhiteCastleLegal =
    white_long_castle_legal || white_short_castle_legal;
  let selectedPiece: SharedTypes.IBlackPiece | SharedTypes.IWhitePiece | null =
    null;

  const onDragStart = (e: Types.DragEvent) => {
    const pieceColor = piece[0];

    const target = e.target as HTMLDivElement;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${piece},${rank},${file}`);
    setTimeout(() => {
      target.style.display = "none";
    }, 0);

    if (pieceColor === "w") {
      selectedPiece = copyPiecesPosition.white_pieces.filter(
        (piece) =>
          piece.position[0] === file + 1 && piece.position[1] === rank + 1
      )[0];
      dispatch(setSelectedPiece(selectedPiece));
    } else {
      selectedPiece = copyPiecesPosition.black_pieces.filter(
        (piece) =>
          piece.position[0] === file + 1 && piece.position[1] === rank + 1
      )[0];
      dispatch(setSelectedPiece(selectedPiece));
    }

    if (current_player[0] === piece[0]) {
      let candidateMoves = [
        ...selectedPiece?.valid_moves,
        ...selectedPiece?.capturing_moves,
      ].map((pos) => [pos[1] - 1, pos[0] - 1]);
      if (
        (isBlackCastleLegal || isWhiteCastleLegal) &&
        (piece === "wking" || piece === "bking")
      ) {
        candidateMoves = [
          ...candidateMoves,
          ...Functions.getCastlingMoves(
            black_long_castle_legal,
            black_short_castle_legal,
            white_long_castle_legal,
            white_short_castle_legal,
            piece
          ),
        ];
      }
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
      draggable={!isGameEnded}
      onDragStart={!isGameEnded ? onDragStart : null}
      onDragEnd={!isGameEnded ? onDragEnd : null}
      className={`${piece} position: ${file}${rank}`}
    />
  );
};

export default Piece;
