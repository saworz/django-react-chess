import styled from "styled-components";
import { Text, Image, Box } from "@chakra-ui/react";

export const PageTitle = styled(Text)`
  font-weight: 900;
  font-size: 4rem;
  @media screen and (max-width: 510px) {
    font-size: 2rem;
  }
`;

export const PageSubTitle = styled(Text)`
  font-weight: 900;
  font-size: 2rem;
  @media screen and (max-width: 510px) {
    font-size: 1.5rem;
  }
`;

export const PageTitleIcon = styled(Image)`
  height: 90px;
  width: 90px;
  @media screen and (max-width: 510px) {
    height: 45px;
    width: 45px;
  }
`;

export const TableRowListContainer = styled(Box)`
  height: 70vh;
`;
