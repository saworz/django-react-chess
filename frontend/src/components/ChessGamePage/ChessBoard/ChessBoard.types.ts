import * as SharedTypes from "../../../shared/types";

export interface IProps {
  isGameStarted: boolean;
  gameRoomId: number;
  piecesPositions: SharedTypes.IPiecesPositions;
  setPiecesPositions: React.Dispatch<
    React.SetStateAction<SharedTypes.IPiecesPositions | undefined>
  >;
}
