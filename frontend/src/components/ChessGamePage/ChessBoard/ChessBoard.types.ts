import { w3cwebsocket as W3CWebSocket } from "websocket";
import * as SharedTypes from "../../../shared/types";

export interface IProps {
  webSocket: W3CWebSocket;
  enemyDetails: SharedTypes.ISuggestionFriendData;
}

export interface ILightTile {}

export interface IDarkTile {}
