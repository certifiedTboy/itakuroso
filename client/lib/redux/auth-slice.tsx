import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  curentUser: null,
};

export const authSlice = createSlice({
  initialState,
  name: "authState",
  reducers: {
    setCurrentUser: (state, action) => {
      state.curentUser = action.payload;
    },
    clearCurrentUser: (state, action) => {
      state.curentUser = null;
    },
  },
});

export default authSlice.reducer;

export const { setCurrentUser, clearCurrentUser } = authSlice.actions;
