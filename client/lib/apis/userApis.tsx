import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let baseUrl = process.env.EXPO_PUBLIC_API_URL;

export const userApis = createApi({
  reducerPath: "userApis",
  baseQuery: fetchBaseQuery({
    baseUrl,
    // prepareHeaders: async (headers, { getState }) => {
    //   const token = process.env.EXPO_PUBLIC_API_KEY;

    //   headers.set("Authorization", `Bearer ${token}`);
    //   return headers;
    // },
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
  }),
});

export const { useCreateNewUserMutation, useVerifyUserAccountMutation } =
  userApis;
