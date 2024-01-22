import styled from "styled-components";
import * as Types from "./PlayerDetails.types";
import { Box } from "@chakra-ui/react";

export const Piece = styled(Box)<Types.IPieceProps>`
  width: 25px;
  height: 25px;
  background-image: ${(props) => `url(/assets/${props.$piece}.png)`};
  background-size: 100%;
`;
