import { upsertUserProfile } from "@/helpers/database/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCurrentUser } from "../redux/auth-slice";

let baseUrl = process.env.EXPO_PUBLIC_API_URL;

export const userApis = createApi({
  reducerPath: "userApis",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: async (headers, { getState }) => {
      const authToken = await AsyncStorage.getItem("accessToken");

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
            const { accessToken, refreshToken, user } = data.data;

            await AsyncStorage.setItem("accessToken", accessToken);
            await AsyncStorage.setItem("refreshToken", refreshToken);

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
          // @ts-ignore
          if (error?.error?.data.message === "jwt expired") {
            dispatch(
              userApis.endpoints.getNewToken.initiate({
                refreshToken: await AsyncStorage.getItem("refreshToken"),
              })
            );
          }
        }
      },
    }),

    getUserProfile: builder.mutation({
      query: (payload) => ({
        url: `/auth/user/${payload}/profile`,
        method: "GET",
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          const userProfileData = {
            id: data?.data._id.toString(),
            phoneNumber: data?.data.phoneNumber,
            isActive: data?.data?.isActive,
            isOnline: data?.data?.isOnline,
            lastSeen: data?.data?.lastSeen,
            profilePicture: data?.data?.profilePicture,
          };

          await upsertUserProfile(userProfileData);
        } catch (error) {
          console.log(error);
        }
      },
    }),

    uploadProfileImage: builder.mutation({
      query: (payload) => ({
        url: `/users/profile/upload-image`,
        method: "PATCH",
        body: payload,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setCurrentUser({ currentUser: data.data }));
        } catch (error: unknown) {
          console.log(error);
        }
      },
    }),

    getNewToken: builder.mutation({
      query: (payload) => ({
        url: `/auth/new-token`,
        method: "POST",
        body: payload,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data) {
            const { accessToken, user } = data.data;

            await AsyncStorage.setItem("accessToken", accessToken);

            dispatch(setCurrentUser({ currentUser: user }));
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),

    getNewVerificationCode: builder.mutation({
      query: (payload) => ({
        url: `/users/passcode/reset`,
        method: "POST",
        body: payload,
      }),
    }),

    requestPasscodeReset: builder.mutation({
      query: (payload) => ({
        url: `/users/request-passcode-reset`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useCreateNewUserMutation,
  useVerifyUserAccountMutation,
  useUpdatePasscodeMutation,
  useGetCurrentUserMutation,
  useGetUserProfileMutation,
  useGetNewVerificationCodeMutation,
  useRequestPasscodeResetMutation,
  useUploadProfileImageMutation,
} = userApis;
