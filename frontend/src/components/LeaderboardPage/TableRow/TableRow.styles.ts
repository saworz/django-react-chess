import { Box, Stack } from "@chakra-ui/react";
import styled from "styled-components";

export const LeaderboardStack = styled(Stack)`
  flex-direction: row;
  @media screen and (max-width: 605px) {
    flex-direction: column;
    width: 300px;
  }
`;

export const DetailsContainer = styled(Box)``;
