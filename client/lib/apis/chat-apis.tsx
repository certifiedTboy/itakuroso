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
      query: ({ roomId }) => ({
        url: `/chats/${roomId}`,
        method: "GET",
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data) {
            // console.log("chats", data?.data.map);
            // console.log(chatData[0]);
            // await createChatTable();
            // await insertChat(data?.data);
            // await insertChat(chatData);
            // await insertChat(data?.data);
          }
        } catch (error: unknown) {
          console.log(error);
        }
      },
    }),

    uploadFile: builder.mutation({
      query: (payload) => ({
        url: "/chats/file/upload",
        method: "POST",
        body: payload,
      }),
    }),

    deleteFile: builder.mutation({
      query: (payload) => ({
        url: `/chats/file/delete/${payload}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetExisitngRoomsMutation,
  useGetChatsByRoomIdMutation,
  useUploadFileMutation,
  useDeleteFileMutation,
} = chatApis;
