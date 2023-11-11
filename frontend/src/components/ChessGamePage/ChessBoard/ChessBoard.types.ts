import * as SharedTypes from "../../../shared/types";

export interface IProps {
  isGameStarted: boolean;
  gameRoomId: number;
  piecesPositions: SharedTypes.IPiecesPositions;
}
