import {
  IAuthState,
  IRegisterUserData,
  ILoginUserData,
} from "../../shared/types";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

//Get user from local storage
const user = JSON.parse(localStorage.getItem("user")!);

const initialState: IAuthState = {
  user: user ? user : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

//Registration - async function
export const register = createAsyncThunk(
  "auth/register",
  async (user: IRegisterUserData, thunkAPI) => {
    try {
      return await authService.register(user);
    } catch (error: any) {
      const message = error.response.data;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//Login - async function
export const login = createAsyncThunk(
  "auth/login",
  async (user: ILoginUserData, thunkAPI) => {
    try {
      return await authService.login(user);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//Logout
export const logout = createAsyncThunk("auth/logout", () => {
  authService.logout();
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    //when we want to restore the default state
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  //Account state - pendning, fullfiled, rejected
  extraReducers(builder) {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null!;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem(
          "token",
          JSON.stringify({
            accessToken: action.payload.jwt_access_token,
            refreshToken: action.payload.jwt_refresh_token,
          })
        );
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null!;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
