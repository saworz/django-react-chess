import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { Status } from "../../../constants";
import { ModalContent, ModalOverlay } from "@chakra-ui/react";
import { closePopup } from "../../../features/popup/popupSlice";
import * as Styles from "./PromotionPopup.styles";
import * as Types from "./PromotionPopup.types";
import {
  changeGameStatus,
  updatePosition,
} from "../../../features/chess/chessSlice";
import Functions from "../../../utils/Functions";

const PromotionPopup = ({ webSocket }: Types.IProps) => {
  const { chess } = useSelector((state: RootState) => state.chess);
  const { popup } = useSelector((state: RootState) => state.popup);
  const { promotionSquare } = chess;
  const colorPiece = promotionSquare?.x === 7 ? "w" : "b";
  const options = ["queen", "rook", "bishop", "knight"];

  const dispatch: AppDispatch = useDispatch();

  if (
    chess.gameStatus === Status.ongoing ||
    chess.gameStatus === Status.black ||
    chess.gameStatus === Status.white
  ) {
    return null;
  }

  if (!promotionSquare) {
    return null;
  }

  const getPromotionBoxPosition = () => {
    let style: {
      top?: string;
      right?: string;
      left?: string;
      height?: string;
    } = {};
    style.height = "90px";

    if (promotionSquare.x === 7) {
      style.top = "7%";
    } else {
      style.top = "75%";
    }

    if (promotionSquare.y <= 1) {
      style.left = "-25%";
    } else if (promotionSquare.y >= 5) {
      style.left = "-12.9%";
    } else {
      style.left = `${12.5 * promotionSquare.y - 44}%`;
    }

    return style;
  };

  const onClose = () => {
    dispatch(closePopup());
  };

  const handleClick = (piece: string) => {
    let updatedPiecesPosition = { ...chess.piecesData.piecesPosition };

    try {
      webSocket.send(
        JSON.stringify({
          data_type: "move",
          color: promotionSquare.selectedPieceColor,
          piece: promotionSquare.selectedPieceId,
          new_position: `${promotionSquare.y + 1}${promotionSquare.x + 1}`,
          promote_to: piece,
        })
      );
      dispatch(closePopup());
      dispatch(changeGameStatus(Status.ongoing));
      updatedPiecesPosition = Functions.promotePiece(
        updatedPiecesPosition,
        promotionSquare.selectedPieceId,
        promotionSquare.selectedPieceColor,
        piece
      );
      dispatch(updatePosition(updatedPiecesPosition));
    } catch (error) {}
  };
  return (
    <Styles.Popup
      closeOnOverlayClick={false}
      isOpen={popup.isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent style={getPromotionBoxPosition()}>
        <Styles.PopupBody justifyContent="center">
          {options.map((piece) => (
            <Styles.Piece
              key={piece}
              $piece={colorPiece + piece}
              className={`piece-promotion-${colorPiece + piece}`}
              onClick={() => handleClick(piece)}
            />
          ))}
        </Styles.PopupBody>
      </ModalContent>
    </Styles.Popup>
  );
};

export default PromotionPopup;
