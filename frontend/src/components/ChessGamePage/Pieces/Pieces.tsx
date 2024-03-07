import * as Styles from "./Pieces.styles";
import * as Types from "./Pieces.types";
import Piece from "../Piece/Piece";
import Functions from "../../../utils/Functions";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import {
  clearCandidates,
  updateBoard,
  updatePosition,
  updatePromotionSquare,
} from "../../../features/chess/chessSlice";
import { openPopup } from "../../../features/popup/popupSlice";
import { Status } from "../../../constants";
import * as SharedTypes from "../../../shared/types";

const Pieces = ({ webSocket }: Types.IProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { chess } = useSelector((state: RootState) => state.chess);
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    candidateMoves,
    white_en_passant_field,
    white_en_passant_pawn_to_capture,
    black_en_passant_field,
    black_en_passant_pawn_to_capture,
    black_long_castle_legal,
    black_short_castle_legal,
    white_long_castle_legal,
    white_short_castle_legal,
    gameDetails,
    current_player,
  } = chess;
  const isGameEnded = chess.gameStatus === Status.ongoing ? false : true;
  const isBlackCastleLegal =
    black_long_castle_legal || black_short_castle_legal;
  const isWhiteCastleLegal =
    white_long_castle_legal || white_short_castle_legal;
  const playerColor = user?.id === gameDetails.player_black ? "black" : "white";
  const areYouBlackPieces = chess.gameDetails.yourColor === "black";

  useEffect(() => {
    dispatch(updateBoard(Functions.placeOnTheBoard(chess.piecesPosition)));
  }, [chess.piecesPosition, dispatch]);

  const ref = useRef<HTMLDivElement>(null);

  const calculateCoords = (e: React.MouseEvent) => {
    const { width, left, top } = ref.current!.getBoundingClientRect();
    const size = width / 8;
    const y = Math.floor((e.clientX - left) / size);
    const x = 7 - Math.floor((e.clientY - top) / size);
    return { x, y };
  };

  const enPassantMove = (
    piece: string,
    piecesPosition: {
      black_pieces: SharedTypes.IBlackPiece[];
      white_pieces: SharedTypes.IWhitePiece[];
    }
  ) => {
    const pawnKnocked = piece[0] === "w" ? "b" : "w";
    const x =
      pawnKnocked === "b"
        ? black_en_passant_field[1] - 1
        : white_en_passant_field[1] + 1;

    const y =
      pawnKnocked === "b"
        ? black_en_passant_field[0]
        : white_en_passant_field[0];
    Functions.raisePawn(piecesPosition, pawnKnocked, x, y);
    // -> y
    // -^ x
  };

  const isCastleMove = (x: number, y: number) => {
    const allCastlingMoves = [
      [0, 2],
      [0, 6],
      [7, 2],
      [7, 6],
    ];

    return allCastlingMoves.some(
      (array) => array.toString() === [x, y].toString()
    );
  };

  const onDrop = (e: Types.DragEvent) => {
    if (current_player === playerColor) {
      const { x, y } = calculateCoords(e); //New
      const [piece, rank, file] = e.dataTransfer.getData("text").split(","); //Old

      const placedPawnColor = chess.chessBoard[x][y][0];
      const placedPawn = chess.chessBoard[x][y];
      const selectedPieceColor = chess.selectedPiece?.color;
      const selectedPieceId = chess.selectedPiece?.id;

      let updatedPiecesPosition = { ...chess.piecesPosition };

      let promoteTo: string | null = null;

      if (candidateMoves.find((pos) => pos[0] === x && pos[1] === y)) {
        //En Passant
        if (
          black_en_passant_pawn_to_capture !== null &&
          x === black_en_passant_field[1] - 1 &&
          y === black_en_passant_field[0] - 1
        ) {
          enPassantMove(piece, updatedPiecesPosition);
        }
        if (
          white_en_passant_pawn_to_capture !== null &&
          x === white_en_passant_field[1] - 1 &&
          y === white_en_passant_field[0] - 1
        ) {
          enPassantMove(piece, updatedPiecesPosition);
        }
        //////Castle
        if (
          (piece === "wking" || piece === "bking") &&
          (isBlackCastleLegal || isWhiteCastleLegal) &&
          isCastleMove(x, y)
        ) {
          const pieceColor = piece[0];
          if (Math.abs(y - +file) > 1) {
            if (y === 2) {
              updatedPiecesPosition = Functions.updatePiecePostion(
                updatedPiecesPosition,
                "rook_1",
                pieceColor === "w" ? "white" : "black",
                +rank + 1,
                4
              );
              webSocket.send(
                JSON.stringify({
                  data_type: "castle",
                  castle_type: pieceColor === "w" ? "white_long" : "black_long",
                })
              );
            }
            if (y === 6) {
              updatedPiecesPosition = Functions.updatePiecePostion(
                updatedPiecesPosition,
                "rook_2",
                pieceColor === "w" ? "white" : "black",
                +rank + 1,
                6
              );
              webSocket.send(
                JSON.stringify({
                  data_type: "castle",
                  castle_type:
                    pieceColor === "w" ? "white_short" : "black_short",
                })
              );
            }
          }
        }
        //PROMOTION
        else if (
          (piece === "wpawn" && x === 7) ||
          (piece === "bpawn" && x === 0)
        ) {
          dispatch(
            updatePromotionSquare({
              x,
              y,
              rank,
              file,
              selectedPieceColor,
              selectedPieceId,
            })
          );
          dispatch(openPopup());
        } ///Other moves
        else {
          webSocket.send(
            JSON.stringify({
              data_type: "move",
              color: chess.selectedPiece?.color,
              piece: chess.selectedPiece?.id,
              new_position: `${y + 1}${areYouBlackPieces ? 7 - x + 1 : x + 1}`,
              promote_to: promoteTo,
            })
          );
        }

        //

        updatedPiecesPosition = Functions.updatePiecePostion(
          updatedPiecesPosition,
          chess.selectedPiece!.id,
          chess.selectedPiece!.color,
          x + 1,
          y + 1
        );

        //Remove knocked pawn
        if (placedPawn) {
          Functions.raisePawn(
            updatedPiecesPosition,
            placedPawnColor,
            x + 1,
            y + 1
          );
        }
        dispatch(updatePosition(updatedPiecesPosition));
      }
      dispatch(clearCandidates());
    }
  };

  const onDragOver = (e: Types.DragEvent) => {
    e.preventDefault();
  };

  return (
    <Styles.Pieces
      ref={ref}
      onDrop={!isGameEnded ? onDrop : null}
      onDragOver={onDragOver}
    >
      {chess.chessBoard.map((r, rank) =>
        r.map((f, file) =>
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
