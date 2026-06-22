import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const feeApi = createApi({
    reducerPath: "feeApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["Fee", "FeeDashboard", "Defaulters"],
    endpoints: (builder) => ({
        getAllFees: builder.query({
            query: (params) => ({
                url: "/fee",
                params,
            }),
            providesTags: ["Fee"],
        }),

        getFeeById: builder.query({
            query: (id) => `/fee/${id}`,
            providesTags: ["Fee"],
        }),

        getFeeByStudent: builder.query({
            query: ({ studentId, ...params }) => ({
                url: `/fee/student/${studentId}`,
                params,
            }),
            providesTags: ["Fee"],
        }),

        getFeeByClass: builder.query({
            query: ({ classId, ...params }) => ({
                url: `/fee/class/${classId}`,
                params,
            }),
            providesTags: ["Fee"],
        }),

        createFee: builder.mutation({
            query: (data) => ({
                url: "/fee",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Fee", "FeeDashboard", "Defaulters"],
        }),

        generateFeesForClass: builder.mutation({
            query: (data) => ({
                url: "/fee/generate/class",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Fee", "FeeDashboard", "Defaulters"],
        }),

        generateFeesForSchool: builder.mutation({
            query: (data) => ({
                url: "/fee/generate/school",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Fee", "FeeDashboard", "Defaulters"],
        }),

        updateFee: builder.mutation({
            query: ({ id, data }) => ({
                url: `/fee/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Fee", "FeeDashboard", "Defaulters"],
        }),

        deleteFee: builder.mutation({
            query: (id) => ({
                url: `/fee/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Fee", "FeeDashboard", "Defaulters"],
        }),

        getFeeDashboard: builder.query({
            query: (params) => ({
                url: "/fee/dashboard",
                params,
            }),
            providesTags: ["FeeDashboard"],
        }),

        getDefaulters: builder.query({
            query: (params) => ({
                url: "/fee/defaulters",
                params,
            }),
            providesTags: ["Defaulters"],
        }),
    }),
});

export const {
    useGetAllFeesQuery,
    useGetFeeByIdQuery,
    useGetFeeByStudentQuery,
    useGetFeeByClassQuery,
    useCreateFeeMutation,
    useGenerateFeesForClassMutation,
    useGenerateFeesForSchoolMutation,
    useUpdateFeeMutation,
    useDeleteFeeMutation,
    useGetFeeDashboardQuery,
    useGetDefaultersQuery,
} = feeApi;
