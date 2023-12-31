import { createSlice } from "@reduxjs/toolkit";
import { Status } from "../../constants";
import * as SharedTypes from "../../shared/types";

const initialState: SharedTypes.IChessState = {
  chess: {
    gameRoomId: "",
    isGameStarted: false,
    chessBoard: [],
    current_player: "",
    piecesPosition: {
      black_pieces: [],
      white_pieces: [],
    },
    copyPiecesPosition: {
      black_pieces: [],
      white_pieces: [],
    },
    candidateMoves: [],
    selectedPiece: null,
    black_checked: false,
    black_checkmated: false,
    black_en_passant_field: [],
    black_en_passant_pawn_to_capture: null,
    black_long_castle_legal: false,
    black_short_castle_legal: false,
    black_captured_pieces: [],
    black_score: 0,
    white_checked: false,
    white_checkmated: false,
    white_en_passant_field: [],
    white_en_passant_pawn_to_capture: null,
    white_long_castle_legal: false,
    white_short_castle_legal: false,
    white_captured_pieces: [],
    white_score: 0,
    gameStatus: Status.ongoing,
    promotionSquare: null,
  },
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const chessSlice = createSlice({
  name: "chess",
  initialState,
  reducers: {
    //when we want to restore the default state
    reset: (state) => {
      state = initialState;
    },
    updateGame: (state, action) => {
      state.chess.black_checkmated = action.payload.black_checkmated;
      state.chess.black_checked = action.payload.black_checked;
      state.chess.black_en_passant_field =
        action.payload.black_en_passant_field;
      state.chess.black_en_passant_pawn_to_capture =
        action.payload.black_en_passant_pawn_to_capture;
      state.chess.black_long_castle_legal =
        action.payload.black_long_castle_legal;
      state.chess.black_short_castle_legal =
        action.payload.black_short_castle_legal;
      state.chess.black_captured_pieces = action.payload.black_captured_pieces;
      state.chess.black_score = action.payload.black_score;
      state.chess.white_checked = action.payload.white_checked;
      state.chess.white_checkmated = action.payload.white_checkmated;
      state.chess.white_en_passant_field =
        action.payload.white_en_passant_field;
      state.chess.white_en_passant_pawn_to_capture =
        action.payload.white_en_passant_pawn_to_capture;
      state.chess.white_long_castle_legal =
        action.payload.white_long_castle_legal;
      state.chess.white_short_castle_legal =
        action.payload.white_short_castle_legal;
      state.chess.white_captured_pieces = action.payload.white_captured_pieces;
      state.chess.white_score = action.payload.white_score;
      state.chess.current_player = action.payload.current_player;
      state.chess.copyPiecesPosition.black_pieces = action.payload.black_pieces;
      state.chess.copyPiecesPosition.white_pieces = action.payload.white_pieces;
    },
    initGame: (state, action) => {
      state.chess.copyPiecesPosition.black_pieces =
        action.payload.copy_black_pieces;
      state.chess.copyPiecesPosition.white_pieces =
        action.payload.copy_white_pieces;
      ///
      state.chess.piecesPosition.white_pieces = action.payload.white_pieces;
      state.chess.piecesPosition.black_pieces = action.payload.black_pieces;
      state.chess.black_checkmated = action.payload.black_checkmated;
      state.chess.black_checked = action.payload.black_checked;
      state.chess.white_checked = action.payload.white_checked;
      state.chess.white_checkmated = action.payload.white_checkmated;
      state.chess.current_player = action.payload.current_player;
      state.chess.candidateMoves = [];
      state.chess.gameStatus = Status.ongoing;
    },
    setGameRoomId: (state, action) => {
      state.chess.gameRoomId = action.payload;
    },
    prepareChessGame: (state, action) => {
      state.chess.gameRoomId = action.payload.gameRoomId;
      state.chess.isGameStarted = action.payload.isGameStarted;
    },
    createChessGame: (state, action) => {
      state.chess.gameRoomId = action.payload.gameRoomId;
      state.chess.isGameStarted = action.payload.isGameStarted;
      state.chess.current_player = "white";
    },
    updateBoard: (state, action) => {
      state.chess.chessBoard = action.payload;
      state.chess.candidateMoves = [];
    },
    generateCandidateMoves: (state, action) => {
      state.chess.candidateMoves = action.payload;
    },
    clearCandidates: (state) => {
      state.chess.candidateMoves = [];
      state.chess.selectedPiece = null;
    },
    setSelectedPiece: (state, action) => {
      state.chess.selectedPiece = action.payload;
    },
    updatePosition: (state, action) => {
      state.chess.piecesPosition = action.payload;
    },
    endGameByWin: (state, action) => {
      state.chess.gameStatus =
        action.payload === "w" ? Status.black : Status.white;
    },
    updatePromotionSquare: (state, action) => {
      state.chess.promotionSquare = action.payload;
      state.chess.gameStatus = Status.promoting;
    },
    changeGameStatus: (state, action) => {
      state.chess.gameStatus = action.payload;
    },
  },
  //State - pendning, fullfiled, rejected
  extraReducers() {},
});

export const {
  reset,
  updateGame,
  setGameRoomId,
  prepareChessGame,
  initGame,
  generateCandidateMoves,
  clearCandidates,
  updateBoard,
  setSelectedPiece,
  createChessGame,
  updatePosition,
  endGameByWin,
  updatePromotionSquare,
  changeGameStatus,
} = chessSlice.actions;
export default chessSlice.reducer;
