import { w3cwebsocket as W3CWebSocket } from "websocket";

export interface IPieceProps {
  $piece: string;
}

export interface IProps {
  webSocket: W3CWebSocket;
}
