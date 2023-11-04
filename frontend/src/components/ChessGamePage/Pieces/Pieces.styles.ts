import { Box } from "@chakra-ui/react";
import styled from "styled-components";

export const Pieces = styled(Box)`
  position: absolute;
  left: calc(0.25 * var(--tile-size));
  right: 0;
  top: 0;
  bottom: calc(0.25 * var(--tile-size));
`;
