import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
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
    useForgotPasswordMutation,
    useVerifyForgotPasswordOtpMutation,
    useResetPasswordMutation
} = authApi;