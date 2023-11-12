export interface IProps {}

export interface DragEvent extends React.MouseEvent {
  dataTransfer: DataTransfer;
}
