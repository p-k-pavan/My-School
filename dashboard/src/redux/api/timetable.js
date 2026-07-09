import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const timetableApi = createApi({
    reducerPath: "timetableApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["Timetables"],
    endpoints: (builder) => ({
        createTimetable: builder.mutation({
            query: (data) => ({
                url: "/timetable",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Timetables"],
        }),

        getTimetableByClass: builder.query({
            query: ({ classId, ...params }) => ({
                url: `/timetable/class/${classId}`,
                params,
            }),
            providesTags: ["Timetables"],
        }),

        updateTimetable: builder.mutation({
            query: ({ id, data }) => ({
                url: `/timetable/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Timetables"],
        }),

        deleteTimetable: builder.mutation({
            query: (id) => ({
                url: `/timetable/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Timetables"],
        }),
    }),
});

export const {
    useCreateTimetableMutation,
    useGetTimetableByClassQuery,
    useUpdateTimetableMutation,
    useDeleteTimetableMutation,
} = timetableApi;
