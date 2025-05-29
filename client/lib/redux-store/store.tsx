import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { chatApis } from "../apis/chat-apis";
import { userApis } from "../apis/userApis";
import authSlice from "../redux/auth-slice";

export const store = configureStore({
  reducer: {
    [userApis.reducerPath]: userApis.reducer,
    [chatApis.reducerPath]: chatApis.reducer,
    authState: authSlice,
  },

  devTools: process.env.NODE_ENV !== "production",

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApis.middleware, chatApis.middleware),
});

setupListeners(store.dispatch);
