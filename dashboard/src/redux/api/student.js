import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const studentApi = createApi({
    reducerPath: "studentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["Students"],
    endpoints: (builder) => ({

        getAllStudents: builder.query({
            query: (params) => ({
                url: "/student",
                params,
            }),
            providesTags: ["Students"],
        }),

        getStudentById: builder.query({
            query: (id) => `/student/${id}`,
            providesTags: ["Students"],
        }),

        getStudentsByClass: builder.query({
            query: (classId) => `/student/class/${classId}`,
            providesTags: ["Students"],
        }),

        getStudentsByParent: builder.query({
            query: (parentId) => `/student/parent/${parentId}`,
            providesTags: ["Students"],
        }),

        updateStudent: builder.mutation({
            query: ({ id, data }) => ({
                url: `/student/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Students"],
        }),

        changeStudentStatus: builder.mutation({
            query: ({ id }) => ({
                url: `/student/${id}/status`,
                method: "PUT",
            }),
            invalidatesTags: ["Students"],
        }),
    }),
});

export const {
    useGetAllStudentsQuery,
    useGetStudentByIdQuery,
    useGetStudentsByClassQuery,
    useGetStudentsByParentQuery,
    useUpdateStudentMutation,
    useChangeStudentStatusMutation,
} = studentApi;