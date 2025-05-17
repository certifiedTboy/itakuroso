import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { userApis } from "../apis/userApis";

export const store = configureStore({
  reducer: {
    [userApis.reducerPath]: userApis.reducer,
  },

  devTools: process.env.NODE_ENV !== "production",

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApis.middleware),
});

setupListeners(store.dispatch);
