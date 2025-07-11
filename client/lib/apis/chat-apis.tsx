import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let baseUrl = process.env.EXPO_PUBLIC_API_URL;

export const chatApis = createApi({
  reducerPath: "chatApis",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: async (headers, { getState }) => {
      const authToken = await AsyncStorage.getItem("token");

      headers.set("Authorization", `Bearer ${authToken}`);
      return headers;
    },
  }),

  endpoints: (builder) => ({
    getExisitngRooms: builder.mutation({
      query: () => ({
        url: "/chats/rooms",
        method: "GET",
      }),
    }),

    getChatsByRoomId: builder.mutation({
      query: ({ roomId, pageNum }) => ({
        url: `/chats/${roomId}?page=${pageNum}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetExisitngRoomsMutation, useGetChatsByRoomIdMutation } =
  chatApis;
