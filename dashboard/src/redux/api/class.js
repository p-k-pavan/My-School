import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const classApi = createApi({
    reducerPath: "classApi",

    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),

    tagTypes: ["Class"],

    endpoints: (builder) => ({
        createClass: builder.mutation({
            query: (formData) => ({
                url: "/class",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Class"],
        }),

        bulkUploadClass: builder.mutation({
            query: (file) => {
                const formData = new FormData();

                formData.append("file", file);

                return {
                    url: "/class/upload",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Class"],
        }),

        getClass: builder.query({
            query: () => "/class",
            providesTags: ["Class"],
        }),

        getClassById: builder.query({
            query: (id) => `/class/${id}`,
            providesTags: ["Class"],
        }),

        updateClass: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/class/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Class"],
        }),

        deleteClass: builder.mutation({
            query: (id) => ({
                url: `/class/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Class"],
        }),
    }),
});

export const {
    useCreateClassMutation,
    useBulkUploadClassMutation,
    useGetClassQuery,
    useGetClassByIdQuery,
    useUpdateClassMutation,
    useDeleteClassMutation,
} = classApi;