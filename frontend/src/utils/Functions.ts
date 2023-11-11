import HttpService from "./HttpService";
import * as SharedTypes from "../shared/types";

const prepareChessGame = (
  gameId: string,
  setGameRoomId: React.Dispatch<React.SetStateAction<number>>,
  setIsGameStarted: React.Dispatch<React.SetStateAction<boolean>>
) => {
  HttpService.createChessGame(Number(gameId)).then((response) => {
    if (response?.status === 201) {
      setGameRoomId(response.data.room_id);
      setIsGameStarted(true);
    } else {
      //setIsGameStarted(true);
    }
  });
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
    | SharedTypes.IPiecesPositions["black_pieces"]
    | SharedTypes.IPiecesPositions["white_pieces"]
) => {
  return Object.entries(piecePositions).map(([key, value]) => ({
    id: key,
    ...value,
  }));
};

const fillPositionsPieces = (
  boardPositions: string[][],
  piecesObject:
    | SharedTypes.IPiecesPositions["black_pieces"]
    | SharedTypes.IPiecesPositions["white_pieces"]
) => {
  piecesObject.forEach((piece) => {
    const [row, col] = piece.position;
    boardPositions[col - 1][row - 1] =
      piece.color[0].toLowerCase() + piece.piece_type.toLowerCase();
  });
};

const createInitGame = (piecesPositions: SharedTypes.IPiecesPositions) => {
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
