import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const homeworkApi = createApi({
    reducerPath: "homeworkApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
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

        createHomework: builder.mutation({
            query: (formData) => ({
                url: "/homework",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Homework"],
        }),

        updateHomework: builder.mutation({
            query: (formData) => ({
                url: "/homework",
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Homework"],
        }),

        deleteHomework: builder.mutation({
            query: (id) => ({
                url: `/homework/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Homework"],
        }),
    }),
});

export const {
    useGetHomeworkByClassQuery,
    useCreateHomeworkMutation,
    useUpdateHomeworkMutation,
    useDeleteHomeworkMutation,
} = homeworkApi;