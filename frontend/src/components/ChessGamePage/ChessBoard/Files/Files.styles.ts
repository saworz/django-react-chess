import { Box } from "@chakra-ui/react";
import styled from "styled-components";

export const Files = styled(Box)`
  color: white;
  height: calc(0.25 * var(--tile-size));
  grid-column: 2;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;
