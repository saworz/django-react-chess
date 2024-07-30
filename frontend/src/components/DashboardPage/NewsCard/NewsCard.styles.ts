import { Card } from "@chakra-ui/react";
import { ReactComponent as CalendarIcon } from "../../../images/calendar-icon.svg";
import styled from "styled-components";

export const StyledCard = styled(Card)`
  text-align: -webkit-center;
  width: 400px;
`;

export const CalendarIconSvg = styled(CalendarIcon)`
  fill: white;
  height: 24px;
`;
