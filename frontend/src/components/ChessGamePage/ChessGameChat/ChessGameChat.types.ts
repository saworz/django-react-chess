import { w3cwebsocket as W3CWebSocket } from "websocket";
import * as SharedTypes from "../../../shared/types";

export interface IProps {
  webSocket: W3CWebSocket;
  messages: SharedTypes.IMessagesData[];
  enemyDetails: SharedTypes.ISuggestionFriendData;
}
