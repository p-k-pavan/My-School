import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";

const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_BASE_URL) {
        return process.env.EXPO_PUBLIC_API_BASE_URL;
    }
    return Platform.OS === "android" ? "http://192.168.31.144:5000/api" : "http://192.168.31.144:5000/api";
};

export const homeworkApi = createApi({
    reducerPath: "homeworkApi",
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
    tagTypes: ["Homework"],

    endpoints: (builder) => ({
        getHomeworkByClass: builder.query({
            query: ({ classId, assigned }) => ({
                url: `/homework/class/${classId}`,
                params: {
                    assignedDate: assigned,
                },
            }),
            providesTags: ["Homework"],
        }),

        getHomeworkByTeacher: builder.query({
            query: ({assigned }) => ({
                url: `/homework/teacher`,
                params: {
                    assignedDate: assigned,
                },
            }),
            providesTags: ["Homework"],
        }),
    }),
});

export const {
    useGetHomeworkByClassQuery,
    useGetHomeworkByTeacherQuery
} = homeworkApi;