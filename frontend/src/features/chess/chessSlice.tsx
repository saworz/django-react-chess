import { createSlice } from "@reduxjs/toolkit";
import * as SharedStyles from "../../shared/types";

const initialState: SharedStyles.IChessState = {
  chess: {
    gameRoomId: "",
    isGameStarted: false,
    chessBoard: [],
    turn: "",
    piecesPosition: {
      black_pieces: [],
      white_pieces: [],
    },
    candidateMoves: [],
    selectedPiece: null,
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
    setPiecesPosition: (state, action) => {
      state.chess.piecesPosition = action.payload;
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
      state.chess.turn = "white";
    },
    changeTurn: (state, action) => {
      state.chess.turn = action.payload;
    },
    initGame: (state, action) => {
      state.chess.turn = "white";
      state.chess.chessBoard = action.payload;
      state.chess.candidateMoves = [];
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
  },
  //State - pendning, fullfiled, rejected
  extraReducers() {},
});

export const {
  reset,
  setPiecesPosition,
  setGameRoomId,
  prepareChessGame,
  changeTurn,
  initGame,
  generateCandidateMoves,
  clearCandidates,
  updateBoard,
  setSelectedPiece,
  createChessGame,
} = chessSlice.actions;
export default chessSlice.reducer;
