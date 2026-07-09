import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";

const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_BASE_URL) {
        return process.env.EXPO_PUBLIC_API_BASE_URL;
    }
    return Platform.OS === "android" ? "http://192.168.31.144:5000/api" : "http://192.168.31.144:5000/api";
};

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: getBaseUrl(),
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
        credentials: "include",
    }),
    tagTypes: ["User"],

    endpoints: (builder) => ({
        login: builder.mutation({
            query: (formData) => ({
                url: "/auth/login",
                method: "POST",
                body: formData,
            }),
        }),

        logout: builder.mutation({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
        }),

        registerDeviceToken: builder.mutation({
            query: (data) => ({
                url: "/auth/device-token",
                method: "POST",
                body: data,
            }),
        }),

        deactivateDeviceToken: builder.mutation({
            query: (data) => ({
                url: "/auth/device-token/deactivate",
                method: "POST",
                body: data,
            }),
        }),

        forgotPassword: builder.mutation({
            query: (data) => ({
                url: "/auth/forgot-password",
                method: "POST",
                body: data,
            }),
        }),

        verifyForgotPasswordOtp: builder.mutation({
            query: (data) => ({
                url: "/auth/verify-otp",
                method: "POST",
                body: data,
            }),
        }),

        resetPassword: builder.mutation({
            query: (data) => ({
                url: "/auth/reset-password",
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useRegisterDeviceTokenMutation,
    useDeactivateDeviceTokenMutation,
    useForgotPasswordMutation,
    useVerifyForgotPasswordOtpMutation,
    useResetPasswordMutation
} = authApi;