import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Status } from "../../constants";
import chessService from "./chessService";
import axios from "axios";
import * as SharedTypes from "../../shared/types";

const initialState: SharedTypes.IChessState = {
  chess: {
    gameDetails: {
      id: -1,
      room_id: "",
      player_white: -1,
      player_black: -1,
      yourColor: "",
      yourId: -1,
    },
    gameRoomId: "",
    isGameStarted: false,
    chessBoard: [],
    piecesData: {
      piecesPosition: {
        black_pieces: [],
        white_pieces: [],
      },
      copyPiecesPosition: {
        black_pieces: [],
        white_pieces: [],
      },
    },
    endGameStatus: {
      black_checked: false,
      black_checkmated: false,
      draw: false,
      white_checked: false,
      white_checkmated: false,
    },
    playersData: {
      black_score: -1,
      white_score: -1,
      white_captures: [],
      black_captures: [],
      allGameMoves: [],
      previousMoveNotation: "",
      current_player: "",
      white_time_left: "",
      black_time_left: "",
    },
    candidateMoves: [],
    selectedPiece: null,
    black_en_passant_field: [],
    black_en_passant_pawn_to_capture: null,
    black_long_castle_legal: false,
    black_short_castle_legal: false,
    white_en_passant_field: [],
    white_en_passant_pawn_to_capture: null,
    white_long_castle_legal: false,
    white_short_castle_legal: false,
    gameStatus: Status.ongoing,
    gameWinner: "",
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
  async (data: { gameId: string; yourId: number | undefined }, thunkAPI) => {
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

export const updatePlayerScore = createAsyncThunk(
  "/chess/updatePlayerScore",
  async (
    data: { whitePlayerPk: number; blackPlayerPk: number; gameOutcome: number },
    thunkAPI
  ) => {
    try {
      return await chessService.updatePlayerScore(data);
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

export const deleteGameRoom = createAsyncThunk(
  "/chess/deleteGameRoom",
  async (data: string, thunkAPI) => {
    try {
      return await chessService.deleteGameRoom(data);
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
      state.chess.endGameStatus.black_checkmated =
        action.payload.black_checkmated;
      state.chess.endGameStatus.black_checked = action.payload.black_checked;
      state.chess.black_en_passant_field =
        action.payload.black_en_passant_field;
      state.chess.black_en_passant_pawn_to_capture =
        action.payload.black_en_passant_pawn_to_capture;
      state.chess.black_long_castle_legal =
        action.payload.black_long_castle_legal;
      state.chess.black_short_castle_legal =
        action.payload.black_short_castle_legal;

      state.chess.endGameStatus.white_checked = action.payload.white_checked;
      state.chess.endGameStatus.white_checkmated =
        action.payload.white_checkmated;
      state.chess.white_en_passant_field =
        action.payload.white_en_passant_field;
      state.chess.white_en_passant_pawn_to_capture =
        action.payload.white_en_passant_pawn_to_capture;
      state.chess.white_long_castle_legal =
        action.payload.white_long_castle_legal;
      state.chess.white_short_castle_legal =
        action.payload.white_short_castle_legal;
      state.chess.playersData.current_player = action.payload.current_player;
      state.chess.playersData.black_score = action.payload.black_score;
      state.chess.playersData.white_score = action.payload.white_score;
      state.chess.piecesData.copyPiecesPosition.black_pieces =
        action.payload.black_pieces;
      state.chess.piecesData.copyPiecesPosition.white_pieces =
        action.payload.white_pieces;
      state.chess.piecesData.piecesPosition.black_pieces =
        action.payload.black_pieces;
      state.chess.piecesData.piecesPosition.white_pieces =
        action.payload.white_pieces;
    },
    initGame: (state, action) => {
      state.chess.playersData.white_score = 0;
      state.chess.playersData.black_score = 0;
      state.chess.endGameStatus.black_checkmated =
        action.payload.black_checkmated;
      state.chess.endGameStatus.black_checked = action.payload.black_checked;
      state.chess.endGameStatus.white_checked = action.payload.white_checked;
      state.chess.endGameStatus.white_checkmated =
        action.payload.white_checkmated;
      state.chess.playersData.current_player = action.payload.current_player;
      state.chess.playersData.previousMoveNotation = "";
      state.chess.candidateMoves = [];
      state.chess.playersData.allGameMoves = [];
      state.chess.gameStatus = Status.ongoing;
    },
    updatePiecesData: (state, action) => {
      state.chess.piecesData.piecesPosition.white_pieces =
        action.payload.white_pieces;
      state.chess.piecesData.piecesPosition.black_pieces =
        action.payload.black_pieces;
      state.chess.piecesData.copyPiecesPosition.black_pieces =
        action.payload.copy_black_pieces;
      state.chess.piecesData.copyPiecesPosition.white_pieces =
        action.payload.copy_white_pieces;
    },
    updatePlayersData: (state, action) => {
      state.chess.playersData.black_score = action.payload.black_score;
      state.chess.playersData.white_score = action.payload.white_score;
      state.chess.playersData.black_captures =
        action.payload.black_captured_pieces;
      state.chess.playersData.white_captures =
        action.payload.white_captured_pieces;
      state.chess.playersData.current_player = action.payload.current_player;
      state.chess.playersData.allGameMoves = action.payload
        .move_in_chess_notation
        ? [
            ...state.chess.playersData.allGameMoves,
            action.payload.move_in_chess_notation,
          ]
        : [];
      state.chess.playersData.previousMoveNotation =
        action.payload.move_in_chess_notation;
      state.chess.playersData.white_time_left = action.payload.white_time_left;
      state.chess.playersData.black_time_left = action.payload.black_time_left;
    },
    updateEndGameStatus: (state, action) => {},
    setGameRoomId: (state, action) => {
      state.chess.gameRoomId = action.payload;
    },
    createChessGame: (state, action) => {
      state.chess.gameRoomId = action.payload.gameRoomId;
      state.chess.isGameStarted = action.payload.isGameStarted;
      state.chess.playersData.current_player = "white";
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
      state.chess.piecesData.piecesPosition = action.payload;
    },
    endGameByWin: (state, action) => {
      state.chess.gameStatus =
        action.payload.colorWinner === "w" ? Status.black : Status.white;
      state.chess.gameWinner = action.payload.winner;
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
        state.chess.playersData.current_player = "white";
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
        const playerWhiteId = action.payload.player_white;
        const playerBlackId = action.payload.player_black;
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.chess.gameDetails.id = action.payload.id;
        state.chess.playersData.white_score = action.payload.white_score;
        state.chess.playersData.black_score = action.payload.black_score;
        state.chess.playersData.white_captures =
          whiteCaptures === null ? [] : whiteCaptures;
        state.chess.playersData.black_captures =
          blackCaptures === null ? [] : blackCaptures;
        state.chess.playersData.current_player = action.payload.current_player;
        state.chess.gameDetails.room_id = action.payload.room_id;
        state.chess.gameDetails.player_white = playerWhiteId;
        state.chess.gameDetails.player_black = playerBlackId;
        state.chess.gameDetails.yourId = action.payload.yourId;
        state.chess.gameDetails.yourColor =
          action.payload.yourId === playerBlackId ? "black" : "white";
      })
      .addCase(getGameRoomDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(deleteGameRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteGameRoom.fulfilled, (state, action) => {})
      .addCase(deleteGameRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(updatePlayerScore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePlayerScore.fulfilled, (state, action) => {})
      .addCase(updatePlayerScore.rejected, (state, action) => {
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
  updatePiecesData,
  updatePlayersData,
  updateEndGameStatus,
} = chessSlice.actions;
export default chessSlice.reducer;
