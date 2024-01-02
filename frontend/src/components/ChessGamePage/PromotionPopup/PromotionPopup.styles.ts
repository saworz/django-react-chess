import styled from "styled-components";
import { Box, Modal, ModalBody } from "@chakra-ui/react";
import * as Types from "./PromotionPopup.types";

export const Piece = styled(Box)<Types.IPieceProps>`
  width: 90px;
  height: 100%;
  background-image: ${(props) => `url(/assets/${props.$piece}.png)`};
  background-size: 85%;
  background-position: center;
  border-left: 1px solid var(--dark-tile);
  background-color: var(--light-tile);
  &:hover {
    box-shadow: 0 0 0 5px var(--dark-tile) inset;
    transform: scale(1.05);
  }
`;

export const PopupBody = styled(ModalBody)`
  display: flex;
  padding: 0;
  background-color: var(--dark-tile);
`;

export const Popup = styled(Modal)`
  background-color: red;
`;
