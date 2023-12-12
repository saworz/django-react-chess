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
    const [x, y] = piece.position;
    boardPositions[y - 1][x - 1] =
      piece.color[0].toLowerCase() + piece.piece_type.toLowerCase();
  });
};

const placeOnTheBoard = (piecesPositions: SharedTypes.IPiecesPosition) => {
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

const updatePiecePostion = (
  piecesPosition: {
    black_pieces: SharedTypes.IBlackPiece[];
    white_pieces: SharedTypes.IWhitePiece[];
  },
  selectedPiece: SharedTypes.IBlackPiece | SharedTypes.IWhitePiece,
  newX: number,
  newY: number
) => {
  if (selectedPiece.color === "white") {
    const whitePieceIndex = piecesPosition.white_pieces.findIndex(
      (piece) => piece.id === selectedPiece.id
    );
    if (whitePieceIndex !== -1) {
      const updatedWhitePiece = {
        ...piecesPosition.white_pieces[whitePieceIndex],
      };
      updatedWhitePiece.position = [newY, newX];

      // Zaktualizuj tablicę białych figur w stanie gry
      piecesPosition.white_pieces = [
        ...piecesPosition.white_pieces.slice(0, whitePieceIndex),
        updatedWhitePiece,
        ...piecesPosition.white_pieces.slice(whitePieceIndex + 1),
      ];

      return piecesPosition;
    }
  } else {
    const blackPieceIndex = piecesPosition.black_pieces.findIndex(
      (piece) => piece.id === selectedPiece.id
    );
    if (blackPieceIndex !== -1) {
      const updatedBlackPiece = {
        ...piecesPosition.black_pieces[blackPieceIndex],
      };
      updatedBlackPiece.position = [newY, newX];

      // Zaktualizuj tablicę czarnych figur w stanie gry
      piecesPosition.black_pieces = [
        ...piecesPosition.black_pieces.slice(0, blackPieceIndex),
        updatedBlackPiece,
        ...piecesPosition.black_pieces.slice(blackPieceIndex + 1),
      ];

      return piecesPosition;
    }
  }
  return piecesPosition;
};

const raisePawn = (
  piecesPosition: {
    black_pieces: SharedTypes.IBlackPiece[];
    white_pieces: SharedTypes.IWhitePiece[];
  },
  placedPawnColor: string,
  newX: number,
  newY: number
) => {
  if (placedPawnColor === "w") {
    const whitePieceIndex = piecesPosition.white_pieces.findIndex(
      (piece) => piece.position[0] === newY && piece.position[1] === newX
    );
    piecesPosition.white_pieces = [
      ...piecesPosition.white_pieces.slice(0, whitePieceIndex),
      ...piecesPosition.white_pieces.slice(whitePieceIndex + 1),
    ];
  } else {
    const blackPieceIndex = piecesPosition.black_pieces.findIndex(
      (piece) => piece.position[0] === newY && piece.position[1] === newX
    );
    piecesPosition.black_pieces = [
      ...piecesPosition.black_pieces.slice(0, blackPieceIndex),
      ...piecesPosition.black_pieces.slice(blackPieceIndex + 1),
    ];
  }
  return piecesPosition;
};

const Functions = {
  updatePiecePostion,
  prepareChessGame,
  placeOnTheBoard,
  computeGameId,
  mapPiecesToArray,
  fillPositionsPieces,
  copyPosition,
  raisePawn,
};

export default Functions;
