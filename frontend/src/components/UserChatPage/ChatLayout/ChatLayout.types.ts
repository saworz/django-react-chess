import * as SharedTypes from "../../../shared/types";
import { w3cwebsocket as W3CWebSocket } from "websocket";

export interface IProps {
  userDetails: SharedTypes.ISuggestionFriendData;

  chatRoomId: number;
}
