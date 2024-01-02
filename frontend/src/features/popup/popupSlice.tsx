import { createSlice } from "@reduxjs/toolkit";
import * as SharedTypes from "../../shared/types";

const initialState: SharedTypes.IPopupState = {
  popup: {
    isOpen: false,
  },
};

export const popupSlice = createSlice({
  name: "popup",
  initialState,
  reducers: {
    //when we want to restore the default state
    reset: (state) => {
      state = initialState;
    },
    openPopup: (state) => {
      state.popup.isOpen = true;
    },
    closePopup: (state) => {
      state.popup.isOpen = false;
    },
  },
  //State - pendning, fullfiled, rejected
  extraReducers() {},
});

export const { reset, openPopup, closePopup } = popupSlice.actions;
export default popupSlice.reducer;
