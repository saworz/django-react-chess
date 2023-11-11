import { Box } from "@chakra-ui/react";
import * as Types from "./Piece.types";
import styled from "styled-components";

export const Piece = styled(Box)<Types.IPieceProps>`
  width: 12.5%;
  height: 12.5%;
  position: absolute;
  background-image: ${(props) => `url(/assets/${props.$piece}.png)`};
  background-size: 100%;
  transform: translate(
    ${(props) => `${props.$file}00%`},
    ${(props) => `${-100 * props.$rank + 700}%`}
  );
  pointer-events: none;
`;
