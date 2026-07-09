import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const subjectApi = createApi({
    reducerPath: "subjectApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["Subjects"],
    endpoints: (builder) => ({
        createSubject: builder.mutation({
            query: (data) => ({
                url: "/subject",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Subjects"],
        }),

        getSubjects: builder.query({
            query: (params) => ({
                url: "/subject",
                params,
            }),
            providesTags: ["Subjects"],
        }),

        getSubjectById: builder.query({
            query: (id) => `/subject/${id}`,
            providesTags: ["Subjects"],
        }),

        updateSubject: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/subject/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Subjects"],
        }),

        deleteSubject: builder.mutation({
            query: (id) => ({
                url: `/subject/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Subjects"],
        }),
    }),
});

export const {
    useCreateSubjectMutation,
    useGetSubjectsQuery,
    useGetSubjectByIdQuery,
    useUpdateSubjectMutation,
    useDeleteSubjectMutation,
} = subjectApi;
