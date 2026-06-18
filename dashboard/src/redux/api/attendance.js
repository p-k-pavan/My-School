import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
    reducerPath: "attendanceApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["Attendance"],
    endpoints: (builder) => ({
        markAttendance: builder.mutation({
            query: (data) => ({
                url: "/attendance",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Attendance"],
        }),

        getAttendanceByStudent: builder.query({
            query: ({ studentId, ...params }) => ({
                url: `/attendance/student/${studentId}`,
                params,
            }),
            providesTags: ["Attendance"],
        }),

        getAttendanceByClass: builder.query({
            query: ({ classId, ...params }) => ({
                url: `/attendance/class/${classId}`,
                params,
            }),
            providesTags: ["Attendance"],
        }),

        updateAttendance: builder.mutation({
            query: ({ id, data }) => ({
                url: `/attendance/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Attendance"],
        }),
    }),
});

export const {
    useMarkAttendanceMutation,
    useGetAttendanceByStudentQuery,
    useGetAttendanceByClassQuery,
    useUpdateAttendanceMutation,
} = attendanceApi;
