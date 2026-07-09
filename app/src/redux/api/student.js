import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";

const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_BASE_URL) {
        return process.env.EXPO_PUBLIC_API_BASE_URL;
    }
    return Platform.OS === "android" ? "http://192.168.31.144:5000/api" : "http://192.168.31.144:5000/api";
};

export const studentApi = createApi({
    reducerPath: "studentApi",
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
    tagTypes: ["Student"],

    endpoints: (builder) => ({
        getStudentById: builder.query({
            query: (studentId) => `/student/${studentId}`,
            providesTags: ["Student"],
        }),
    }),
});

export const {
    useGetStudentByIdQuery
} = studentApi;