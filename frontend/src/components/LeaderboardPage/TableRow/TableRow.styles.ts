import { Box, Stack } from "@chakra-ui/react";
import styled from "styled-components";

export const LeaderboardStack = styled(Stack)`
  flex-direction: row;
  @media screen and (max-width: 605px) {
    flex-direction: column;
    width: 300px;
  }
  @media screen and (max-width: 400px) {
    width: 200px;
  }
`;

export const DetailsContainer = styled(Box)`
  text-align: left;
  margin-left: 8px;
  @media screen and (max-width: 605px) {
    text-align: center;
    margin-left: 0;
  }
`;

export const RankContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  @media screen and (max-width: 605px) {
    align-items: center;
  }
`;
