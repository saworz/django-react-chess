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
  return Object.values(piecePositions).map((piece) => piece);
};

function fillPositionsPieces(
  positionArray: string[][],
  piecesObject:
    | Record<string, SharedTypes.IBlackPiece>
    | Record<string, SharedTypes.IWhitePiece>
) {
  const piecesArray = mapPiecesToArray(piecesObject);

  piecesArray.forEach((piece) => {
    const [row, col] = piece.position;
    positionArray[col - 1][row - 1] =
      piece.color[0].toLowerCase() + piece.piece_type.toLowerCase();
  });

  console.log("A", positionArray);
}

const Functions = {
  prepareChessGame,
  computeGameId,
  mapPiecesToArray,
  fillPositionsPieces,
};

export default Functions;
