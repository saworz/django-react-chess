import * as SharedTypes from "../shared/types";

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
//y=n+1-y'

const transformWhitePieces = (
  piecesObject: SharedTypes.IPiecesPosition["white_pieces"]
) => {
  let copy = piecesObject.map((object) => ({ ...object }));
  copy.forEach((object) => {
    let [x, y] = object.position;
    object.position = [x, 8 + 1 - y];
  });

  return copy;
};

const transformBlackPieces = (
  piecesObject: SharedTypes.IPiecesPosition["black_pieces"]
) => {
  let copy = piecesObject.map((object) => ({ ...object }));
  copy.forEach((object) => {
    let [x, y] = object.position;
    object.position = [x, 8 + 1 - y];
  });

  return copy;
};

const getCorrectImageAndName = (
  loggedColor: string,
  loggedId: number,
  loggedUser: any,
  enemyUser: any,
  colorId: any
) => {
  if (loggedColor === "white") {
    if (colorId === loggedId) {
      return loggedUser;
    }
    return enemyUser;
  } else {
    if (colorId !== loggedId) {
      return loggedUser;
    }
    return enemyUser;
  }
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
  selectedPieceId: string,
  selectedPieceColor: string,
  newX: number,
  newY: number
) => {
  if (selectedPieceColor === "white") {
    const whitePieceIndex = piecesPosition.white_pieces.findIndex(
      (piece) => piece.id === selectedPieceId
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
      (piece) => piece.id === selectedPieceId
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

const getCastlingMoves = (
  black_long_castle_legal: boolean,
  black_short_castle_legal: boolean,
  white_long_castle_legal: boolean,
  white_short_castle_legal: boolean,
  piece: string
) => {
  const pieceColor = piece[0];
  let castlingMoves: number[][] = [];
  if (pieceColor === "w") {
    if (white_long_castle_legal) {
      castlingMoves.push([0, 2]);
    }
    if (white_short_castle_legal) {
      castlingMoves.push([0, 6]);
    }
  } else {
    if (black_long_castle_legal) {
      castlingMoves.push([7, 2]);
    }
    if (black_short_castle_legal) {
      castlingMoves.push([7, 6]);
    }
  }
  return castlingMoves;
};

const promotePiece = (
  piecesPosition: {
    black_pieces: SharedTypes.IBlackPiece[];
    white_pieces: SharedTypes.IWhitePiece[];
  },
  selectedPieceId: string,
  selectedPieceColor: string,
  newPiece: string
) => {
  if (selectedPieceColor === "white") {
    const whitePieceIndex = piecesPosition.white_pieces.findIndex(
      (piece) => piece.id === selectedPieceId
    );
    if (whitePieceIndex !== -1) {
      const updatedWhitePiece = {
        ...piecesPosition.white_pieces[whitePieceIndex],
      };
      updatedWhitePiece.piece_type = newPiece;

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
      (piece) => piece.id === selectedPieceId
    );
    if (blackPieceIndex !== -1) {
      const updatedBlackPiece = {
        ...piecesPosition.black_pieces[blackPieceIndex],
      };
      updatedBlackPiece.piece_type = newPiece;

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

const isLoggedPlayer = (playerId: number, loggedUserId: number) => {
  if (playerId === loggedUserId) {
    return true;
  } else {
    return false;
  }
};

const Functions = {
  updatePiecePostion,
  placeOnTheBoard,
  computeGameId,
  mapPiecesToArray,
  fillPositionsPieces,
  copyPosition,
  raisePawn,
  getCastlingMoves,
  promotePiece,
  isLoggedPlayer,
  transformBlackPiecesPosition: transformBlackPieces,
  transformWhitePiecesPosition: transformWhitePieces,
  getCorrectImageAndName,
};

export default Functions;
