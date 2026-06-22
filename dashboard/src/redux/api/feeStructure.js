import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const feeStructureApi = createApi({
    reducerPath: "feeStructureApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["FeeStructure"],
    endpoints: (builder) => ({
        getFeeStructures: builder.query({
            query: (params) => ({
                url: "/feestructure",
                params,
            }),
            providesTags: ["FeeStructure"],
        }),

        getFeeStructureById: builder.query({
            query: (id) => `/feestructure/${id}`,
            providesTags: ["FeeStructure"],
        }),

        getFeeStructureByYearAndClass: builder.query({
            query: (params) => ({
                url: "/feestructure/lookup",
                params,
            }),
            providesTags: ["FeeStructure"],
        }),

        createFeeStructure: builder.mutation({
            query: (data) => ({
                url: "/feestructure",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["FeeStructure"],
        }),

        updateFeeStructure: builder.mutation({
            query: ({ id, data }) => ({
                url: `/feestructure/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["FeeStructure"],
        }),

        deleteFeeStructure: builder.mutation({
            query: (id) => ({
                url: `/feestructure/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["FeeStructure"],
        }),
    }),
});

export const {
    useGetFeeStructuresQuery,
    useGetFeeStructureByIdQuery,
    useGetFeeStructureByYearAndClassQuery,
    useCreateFeeStructureMutation,
    useUpdateFeeStructureMutation,
    useDeleteFeeStructureMutation,
} = feeStructureApi;
