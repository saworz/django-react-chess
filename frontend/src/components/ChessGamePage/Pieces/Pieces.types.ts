import * as SharedTypes from "../../../shared/types";

export interface IProps {
  isGameStarted: boolean;
  piecesPositions: SharedTypes.IPiecesPositions;
  setPiecesPositions: React.Dispatch<
    React.SetStateAction<SharedTypes.IPiecesPositions | undefined>
  >;
}

export interface DragEvent extends React.MouseEvent {
  dataTransfer: DataTransfer;
}
