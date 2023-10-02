import { IFriendSystemState } from "../../shared/types";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import friendSystemService from "./friendSystemService";

const initialState: IFriendSystemState = {
  friendSystem: {
    suggestionsList: [],
    friendsList: [],
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
      });
  },
});

export const { reset, setFriends, setSuggestions, setSearchInput } =
  friendSystemSlice.actions;
export default friendSystemSlice.reducer;
