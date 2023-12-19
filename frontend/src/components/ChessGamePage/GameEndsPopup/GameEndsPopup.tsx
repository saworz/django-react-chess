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

  const handleClick = () => {
    //dispatch(setupNewGame());
    console.log("NOWA GRA");
  };

  return (
    <Modal isOpen={popup.isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center">{chess.gameStatus}!</ModalHeader>
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
          <Button
            isDisabled={true}
            variant="solid"
            colorScheme="orange"
            onClick={handleClick}
          >
            NEW GAME
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GameEndsPopup;
