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
    makeMove: (state, action) => {
      state.chess.turn = action.payload.nextTurn;
      state.chess.chessBoard = action.payload.newPosition;
    },
    initGame: (state, action) => {
      state.chess.turn = "white";
      state.chess.chessBoard = action.payload;
    },
  },
  //Account state - pendning, fullfiled, rejected
  extraReducers(builder) {},
});

export const {
  reset,
  setPiecesPosition,
  setGameRoomId,
  prepareChessGame,
  makeMove,
  initGame,
} = chessSlice.actions;
export default chessSlice.reducer;
