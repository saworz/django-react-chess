import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import friendReducer from "../features/friendSystem/friendSystemSlice";
import chessReducer from "../features/chess/chessSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    friendSystem: friendReducer,
    chess: chessReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
