import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCurrentUser } from "../redux/auth-slice";

let baseUrl = process.env.EXPO_PUBLIC_API_URL;

export const userApis = createApi({
  reducerPath: "userApis",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: async (headers, { getState }) => {
      const authToken = await AsyncStorage.getItem("token");

      headers.set("Authorization", `Bearer ${authToken}`);
      return headers;
    },
  }),

  endpoints: (builder) => ({
    createNewUser: builder.mutation({
      query: (payload) => ({
        url: "/users/create",
        method: "POST",
        body: payload,
      }),
    }),

    verifyUserAccount: builder.mutation({
      query: (payload) => ({
        url: `/users/verify`,
        method: "PATCH",
        body: payload,
      }),
    }),

    updatePasscode: builder.mutation({
      query: (payload) => ({
        url: `/auth/login`,
        method: "POST",
        body: payload,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data) {
            const { authToken, user } = data.data;

            await AsyncStorage.setItem("authToken", authToken);

            dispatch(setCurrentUser({ currentUser: user }));
          }
        } catch (error) {
          // console.log(error);
        }
      },
    }),

    getCurrentUser: builder.mutation({
      query: () => ({
        url: `/auth/current-user`,
        method: "GET",
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setCurrentUser({ currentUser: data.data }));
        } catch (error: unknown) {
          if (error?.error?.data.message === "jwt expired") {
            dispatch(userApis.endpoints.getNewToken.initiate({}));
          }
        }
      },
    }),

    getNewToken: builder.mutation({
      query: () => ({
        url: `/auth/new-token`,
        method: "GET",
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data) {
            const { authToken, user } = data.data;

            await AsyncStorage.setItem("authToken", authToken);

            dispatch(setCurrentUser({ currentUser: user }));
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
  }),
});

export const {
  useCreateNewUserMutation,
  useVerifyUserAccountMutation,
  useUpdatePasscodeMutation,
  useGetCurrentUserMutation,
} = userApis;
