import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";

const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_BASE_URL) {
        return process.env.EXPO_PUBLIC_API_BASE_URL;
    }
    return Platform.OS === "android" ? "http://192.168.31.144:5000/api" : "http://192.168.31.144:5000/api";
};

export const feedApi = createApi({
    reducerPath: "feedApi",
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
    
    tagTypes: ["Feed"],
    endpoints: (builder) => ({
        getAllFeedPost: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => ({
                url: "/feed",
                params: { page, limit },
            }),
            providesTags: ["Feed"],
        }),

        getFeedPostById: builder.query({
            query: (id) => `/feed/${id}`,
            providesTags: ["Feed"],
        }),
    }),
});

export const {
    useGetAllFeedPostQuery,
    useGetFeedPostByIdQuery
} = feedApi;
