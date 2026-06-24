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
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation
} = authApi;