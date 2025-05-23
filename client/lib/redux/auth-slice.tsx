import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
};

export const authSlice = createSlice({
  initialState,
  name: "authState",
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload.currentUser;
    },
    clearCurrentUser: (state, action) => {
      state.currentUser = null;
    },
  },
});

export default authSlice.reducer;

export const { setCurrentUser, clearCurrentUser } = authSlice.actions;
