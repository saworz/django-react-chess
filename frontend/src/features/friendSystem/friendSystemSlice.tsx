import { IFriendSystemState } from "../../shared/types";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import friendSystemService from "./friendSystemService";

const initialState: IFriendSystemState = {
  friendSystem: {
    suggestionsList: [],
    friendsList: [],
    pendingRequests: [],
    sentRequests: [],
    searchInput: "",
  },
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

//getFriendsList - async function
export const getFriendsList = createAsyncThunk(
  "friendSystem/getFriendsList",
  async (_, thunkAPI) => {
    try {
      return await friendSystemService.getFriendsList();
    } catch (error: any) {
      const message = error.response.data;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//getPendingRequests - async function
export const getPendingRequests = createAsyncThunk(
  "friendSystem/getPendingRequests",
  async (_, thunkAPI) => {
    try {
      return await friendSystemService.getPendingRequests();
    } catch (error: any) {
      const message = error.response.data;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//getSentRequests - async function
export const getSentRequests = createAsyncThunk(
  "friendSystem/getSentRequests",
  async (_, thunkAPI) => {
    try {
      return await friendSystemService.getSentRequests();
    } catch (error: any) {
      const message = error.response.data;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//getSuggestionsList- async function
export const getSuggestionsList = createAsyncThunk(
  "friendSystem/getSuggestionsList",
  async (searchInput: string, thunkAPI) => {
    try {
      return await friendSystemService.getSuggestionsList(searchInput);
    } catch (error: any) {
      const message = error.response.data;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const friendSystemSlice = createSlice({
  name: "friendSystem",
  initialState,
  reducers: {
    //when we want to restore the default state
    reset: (state) => {
      state.friendSystem = {
        friendsList: [],
        suggestionsList: [],
        searchInput: "",
        pendingRequests: [],
        sentRequests: [],
      };
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    setFriends: (state, action) => {
      state.friendSystem.friendsList = action.payload;
    },
    setSuggestions: (state, action) => {
      state.friendSystem.suggestionsList = action.payload;
    },
    setSearchInput: (state, action) => {
      state.friendSystem.searchInput = action.payload;
    },
  },
  //Account state - pendning, fullfiled, rejected
  extraReducers(builder) {
    builder
      .addCase(getFriendsList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFriendsList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friendSystem.friendsList = action.payload;
      })
      .addCase(getFriendsList.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(getSuggestionsList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSuggestionsList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friendSystem.suggestionsList = action.payload;
      })
      .addCase(getSuggestionsList.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(getPendingRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPendingRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friendSystem.pendingRequests = action.payload;
      })
      .addCase(getPendingRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(getSentRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSentRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friendSystem.sentRequests = action.payload;
      })
      .addCase(getSentRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset, setFriends, setSuggestions, setSearchInput } =
  friendSystemSlice.actions;
export default friendSystemSlice.reducer;
