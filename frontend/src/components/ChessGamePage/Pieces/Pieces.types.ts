import { w3cwebsocket as W3CWebSocket } from "websocket";

export interface IProps {
  webSocket: W3CWebSocket;
}

export interface DragEvent extends React.MouseEvent {
  dataTransfer: DataTransfer;
}
