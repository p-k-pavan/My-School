import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const teacherApi = createApi({
    reducerPath: "teacherApi",

    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),

    tagTypes: ["Teacher"],

    endpoints: (builder) => ({
        createTeacher: builder.mutation({
            query: (formData) => ({
                url: "/teacher",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Teacher"],
        }),

        bulkUploadTeacher: builder.mutation({
            query: (file) => {
                const formData = new FormData();

                formData.append("file", file);

                return {
                    url: "/teacher/upload",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Teacher"],
        }),

        getTeachers: builder.query({
            query: () => "/teacher",
            providesTags: ["Teacher"],
        }),

        getTeacherById: builder.query({
            query: (id) => `/teacher/${id}`,
            providesTags: ["Teacher"],
        }),

        getTeacherClasses: builder.query({
            query: (id) => `/teacher/${id}/classes`,
            providesTags: ["Teacher"],
        }),

        updateTeacher: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/teacher/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Teacher"],
        }),

        updateTeacherStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/teacher/${id}/status`,
                method: "PUT",
                body: { status },
            }),
            invalidatesTags: ["Teacher"],
        }),

        assignClass: builder.mutation({
            query: ({ id, assignedClasses }) => ({
                url: `/teacher/${id}/assign-classes`,
                method: "PUT",
                body: { assignedClasses },
            }),
            invalidatesTags: ["Teacher"],
        }),

        removeAssignClass: builder.mutation({
            query: ({ id, classId }) => ({
                url: `/teacher/${id}/remove-class/${classId}`,
                method: "PUT",
            }),
            invalidatesTags: ["Teacher"],
        }),

        getTeacherAssignClasses: builder.query({
            query: (id) => `/teacher/${id}/classes`,
            providesTags: ["Teacher"],
        }),
    }),
});

export const {
    useCreateTeacherMutation,
    useBulkUploadTeacherMutation,
    useGetTeachersQuery,
    useGetTeacherByIdQuery,
    useGetTeacherClassesQuery,
    useUpdateTeacherMutation,
    useUpdateTeacherStatusMutation,
    useAssignClassMutation,
    useRemoveAssignClassMutation,
    useGetTeacherAssignClassesQuery
} = teacherApi;
