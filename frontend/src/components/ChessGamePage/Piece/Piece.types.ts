export interface IProps {
  rank: number;
  file: number;
  piece: string;
}

export interface IPieceProps {
  $rank: number;
  $file: number;
  $piece: string;
}

export interface DragEvent extends React.MouseEvent {
  dataTransfer: DataTransfer;
}
