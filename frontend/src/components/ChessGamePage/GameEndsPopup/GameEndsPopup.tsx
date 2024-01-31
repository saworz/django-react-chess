import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { Status } from "../../../constants";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Image,
} from "@chakra-ui/react";
import { closePopup } from "../../../features/popup/popupSlice";
import WhiteKingImage from "../../../images/wking.png";
import BlackKingImage from "../../../images/bking.png";
import { Link } from "react-router-dom";

const GameEndsPopup = () => {
  const { chess } = useSelector((state: RootState) => state.chess);
  const { popup } = useSelector((state: RootState) => state.popup);

  const dispatch: AppDispatch = useDispatch();

  if (
    chess.gameStatus === Status.ongoing ||
    chess.gameStatus === Status.promoting
  ) {
    return null;
  }

  const onClose = () => {
    dispatch(closePopup());
  };

  return (
    <Modal isOpen={popup.isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center">{chess.gameWinner} wins!</ModalHeader>
        <ModalCloseButton />
        <ModalBody alignSelf="center">
          <Image
            src={
              chess.gameStatus === Status.black
                ? BlackKingImage
                : WhiteKingImage
            }
            alt="Winner-Image"
          />
        </ModalBody>
        <ModalFooter alignSelf="center">
          <Link to="/dashboard">
            <Button variant="solid" colorScheme="orange">
              BACK TO DASHBOARD
            </Button>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GameEndsPopup;
