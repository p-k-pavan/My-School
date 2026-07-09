import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentApi = createApi({
    reducerPath: "paymentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["Payment"],
    endpoints: (builder) => ({
        getAllFeePayments: builder.query({
            query: (params) => ({
                url: "/payment",
                params,
            }),
            providesTags: ["Payment"],
        }),

        getFeePaymentById: builder.query({
            query: (id) => `/payment/${id}`,
            providesTags: ["Payment"],
        }),

        getFeePaymentByStudentId: builder.query({
            query: ({ studentId, ...params }) => ({
                url: `/payment/student/${studentId}`,
                params,
            }),
            providesTags: ["Payment"],
        }),

        createFeePayment: builder.mutation({
            query: (data) => ({
                url: "/payment",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Payment"],
        }),

        voidFeePayment: builder.mutation({
            query: ({ id, reason }) => ({
                url: `/payment/${id}/void`,
                method: "PATCH",
                body: { reason },
            }),
            invalidatesTags: ["Payment"],
        }),
    }),
});

export const {
    useGetAllFeePaymentsQuery,
    useGetFeePaymentByIdQuery,
    useGetFeePaymentByStudentIdQuery,
    useCreateFeePaymentMutation,
    useVoidFeePaymentMutation,
} = paymentApi;
