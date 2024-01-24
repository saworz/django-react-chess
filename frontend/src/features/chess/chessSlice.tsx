import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Status } from "../../constants";
import chessService from "./chessService";
import axios from "axios";
import * as SharedTypes from "../../shared/types";

const initialState: SharedTypes.IChessState = {
  chess: {
    gameDetails: {
      id: -1,
      white_score: -1,
      black_score: -1,
      white_captures: [],
      black_captures: [],
      current_player: "",
      room_id: "",
      player_white: -1,
      player_black: -1,
    },
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
    black_score: 0,
    white_checked: false,
    white_checkmated: false,
    white_en_passant_field: [],
    white_en_passant_pawn_to_capture: null,
    white_long_castle_legal: false,
    white_short_castle_legal: false,
    white_score: 0,
    gameStatus: Status.ongoing,
    promotionSquare: null,
  },
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const postCreateChessGame = createAsyncThunk(
  "/chess/postCreateChessGame",
  async (data: string, thunkAPI) => {
    try {
      return await chessService.postCreateChessGame(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        return thunkAPI.rejectWithValue(message);
      } else {
        console.log("unexpected error: ", error);
        return "An unexpected error occurred";
      }
    }
  }
);

export const getGameRoomDetails = createAsyncThunk(
  "/chess/getGameRoomDetails",
  async (data: string, thunkAPI) => {
    try {
      return await chessService.getGameRoomDetails(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        return thunkAPI.rejectWithValue(message);
      } else {
        console.log("unexpected error: ", error);
        return "An unexpected error occurred";
      }
    }
  }
);

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
      state.chess.gameDetails.black_captures =
        action.payload.black_captured_pieces;
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
      state.chess.gameDetails.white_captures =
        action.payload.white_captured_pieces;
      state.chess.white_score = action.payload.white_score;
      state.chess.current_player = action.payload.current_player;
      state.chess.gameDetails!.black_score = action.payload.black_score;
      state.chess.gameDetails!.white_score = action.payload.white_score;
      state.chess.copyPiecesPosition.black_pieces = action.payload.black_pieces;
      state.chess.copyPiecesPosition.white_pieces = action.payload.white_pieces;
      state.chess.piecesPosition.black_pieces = action.payload.black_pieces;
      state.chess.piecesPosition.white_pieces = action.payload.white_pieces;
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
  extraReducers(builder) {
    builder
      .addCase(postCreateChessGame.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(postCreateChessGame.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.chess.gameRoomId = action.payload.room_id;
        state.chess.isGameStarted = true;
        state.chess.current_player = "white";
      })
      .addCase(postCreateChessGame.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(getGameRoomDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getGameRoomDetails.fulfilled, (state, action) => {
        const whiteCaptures = action.payload.white_captures;
        const blackCaptures = action.payload.black_captures;
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.chess.gameDetails.id = action.payload.id;
        state.chess.gameDetails.white_score = action.payload.white_score;
        state.chess.gameDetails.black_score = action.payload.black_score;
        state.chess.gameDetails.white_captures =
          whiteCaptures === null ? [] : whiteCaptures;
        state.chess.gameDetails.black_captures =
          blackCaptures === null ? [] : blackCaptures;
        state.chess.gameDetails.current_player = action.payload.current_player;
        state.chess.gameDetails.room_id = action.payload.room_id;
        state.chess.gameDetails.player_white = action.payload.player_white;
        state.chess.gameDetails.player_black = action.payload.player_black;
      })
      .addCase(getGameRoomDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const {
  reset,
  updateGame,
  setGameRoomId,
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
