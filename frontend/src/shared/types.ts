export interface IAuthState {
  user: IUserData | null;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

export interface IFriendSystemState {
  friendSystem: {
    suggestionsList: ISuggestionFriendData[];
    friendsList: IFriendData[];
    searchInput: string;
    pendingRequests: IPendingRequestsData[];
    sentRequests: ISuggestionFriendData[];
  };
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

export interface IChessState {
  chess: {
    gameDetails: IChessGameDetails;
    gameRoomId: string;
    isGameStarted: boolean;
    chessBoard: string[][];
    piecesData: {
      piecesPosition: {
        black_pieces: IBlackPiece[];
        white_pieces: IWhitePiece[];
      };
      copyPiecesPosition: {
        black_pieces: IBlackPiece[];
        white_pieces: IWhitePiece[];
      };
    };
    endGameStatus: {
      black_checked: boolean;
      black_checkmated: boolean;
      white_checked: boolean;
      white_checkmated: boolean;
      draw: boolean;
    };
    playersData: {
      black_score: number;
      white_score: number;
      white_captures: string[];
      black_captures: string[];
      previousMoveNotation: string;
      allGameMoves: string[];
      current_player: string;
      black_time_left: string;
      white_time_left: string;
    };
    candidateMoves: number[][];
    selectedPiece: IBlackPiece | IWhitePiece | null;
    black_en_passant_field: number[];
    black_en_passant_pawn_to_capture: string | null;
    black_long_castle_legal: boolean;
    black_short_castle_legal: boolean;
    white_en_passant_field: number[];
    white_en_passant_pawn_to_capture: string | null;
    white_long_castle_legal: boolean;
    white_short_castle_legal: boolean;
    gameStatus: string;
    gameWinner: string;
    promotionSquare: {
      x: number;
      y: number;
      rank: number;
      file: number;
      selectedPieceColor: string;
      selectedPieceId: string;
    } | null;
  };
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

export interface IChessGameDetails {
  id: number;
  room_id: string;
  player_white: number;
  player_black: number;
  yourId: number;
  yourColor: string;
}

export interface IPopupState {
  popup: {
    isOpen: boolean;
  };
}

export interface IPiece {
  id: string;
  piece_type: string;
  color: string;
  capturing_moves: Array<number>[];
  position: number[];
  valid_moves: Array<number>[];
}

export interface IBlackPiece extends IPiece {
  color: "black";
}

export interface IWhitePiece extends IPiece {
  color: "white";
}

export interface IPiecesPosition {
  black_pieces: IBlackPiece[];
  white_pieces: IWhitePiece[];
}

export interface IRegisterUserData {
  username: string;
  email: string;
  password1: string;
  password2: string;
}

export interface ILoginUserData {
  username: string;
  password: string;
}

export interface IUserData {
  id: number;
  username: string;
  email: string;
  image: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface ISuggestionFriendData {
  id: number;
  username: string;
  email: string;
  image: string;
  is_friend: boolean;
  pending_request: boolean;
  request_sender_id: number;
}

export interface IPendingRequestsData {
  id: number;
  username: string;
  email: string;
  image: string;
}

export interface IFriendData {
  id: number;
  username: string;
  email: string;
  image: string;
}

export interface IUpdatePasswordData {
  old_password: string;
  new_password: string;
  repeated_password: string;
}

export interface IMessagesData {
  from: string;
  text: string;
}

export interface ICreateChessGameResponse {
  current_player: string;
  room_id: string;
  player_white: number;
  player_black: number;
}

export interface ICreateChessGameRequest {
  userId: string;
}

export interface IScoreboardList {
  id: number;
  username: string;
  email: string;
  image: string;
  wins: number;
  losses: number;
  elo: number;
  is_friend: boolean;
  pending_request: boolean;
  request_sender_id: number;
}
