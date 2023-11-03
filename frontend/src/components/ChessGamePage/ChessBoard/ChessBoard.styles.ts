import styled from "styled-components";
import { GridItem, Grid } from "@chakra-ui/react";

export const DarkTile = styled(GridItem)`
  background-color: var(--dark-tile);
`;

export const LightTile = styled(GridItem)`
  background-color: var(--light-tile);
`;

export const BoardContainer = styled(Grid)`
  grid-template-columns: calc(0.25 * var(--tile-size)) calc(
      8 * var(--tile-size)
    );
`;

export const Tiles = styled(Grid)`
  grid-template-columns: repeat(8, var(--tile-size));
  grid-template-rows: repeat(8, var(--tile-size));
  width: calc(8 * var(--tile-size));
`;
