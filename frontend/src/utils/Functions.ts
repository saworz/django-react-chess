import HttpService from "./HttpService";
import * as SharedTypes from "../shared/types";

const prepareChessGame = (gameId: string) => {
  let gameRoomId: string = "";
  let isGameStarted: boolean = false;
  HttpService.createChessGame(Number(gameId)).then((response) => {
    if (response?.status === 201) {
      gameRoomId = response.data.room_id;
      isGameStarted = true;
    } else {
      //setIsGameStarted(true); TODO
    }
  });
  return { gameRoomId, isGameStarted };
};

const computeGameId = (loggedUserId: number, enemyId: string) => {
  if (loggedUserId > Number(enemyId)) {
    return enemyId + loggedUserId;
  } else if (loggedUserId < Number(enemyId)) {
    return loggedUserId + enemyId;
  } else {
    return loggedUserId + enemyId;
  }
};

const mapPiecesToArray = (
  piecePositions:
    | SharedTypes.IPiecesPosition["black_pieces"]
    | SharedTypes.IPiecesPosition["white_pieces"]
) => {
  return Object.entries(piecePositions).map(([key, value]) => ({
    id: key,
    ...value,
  }));
};

const fillPositionsPieces = (
  boardPositions: string[][],
  piecesObject:
    | SharedTypes.IPiecesPosition["black_pieces"]
    | SharedTypes.IPiecesPosition["white_pieces"]
) => {
  piecesObject.forEach((piece) => {
    const [row, col] = piece.position;
    boardPositions[col - 1][row - 1] =
      piece.color[0].toLowerCase() + piece.piece_type.toLowerCase();
  });
};

const createInitGame = (piecesPositions: SharedTypes.IPiecesPosition) => {
  const boardPositions: string[][] = new Array(8)
    .fill("")
    .map((x) => new Array(8).fill(""));
  fillPositionsPieces(boardPositions, piecesPositions.black_pieces);
  fillPositionsPieces(boardPositions, piecesPositions.white_pieces);

  return boardPositions;
};

const copyPosition = (position: string[][]) => {
  const newPosition = new Array(8).fill("").map((x) => new Array(8).fill(""));

  for (let rank = 0; rank < position.length; rank++) {
    for (let file = 0; file < position[0].length; file++) {
      newPosition[rank][file] = position[rank][file];
    }
  }

  return newPosition;
};

const Functions = {
  prepareChessGame,
  createInitGame,
  computeGameId,
  mapPiecesToArray,
  fillPositionsPieces,
  copyPosition,
};

export default Functions;
