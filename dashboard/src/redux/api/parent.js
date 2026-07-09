import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const parentApi = createApi({
    reducerPath: "parentApi",

    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),

    tagTypes: ["Parent"],

    endpoints: (builder) => ({
        getParents: builder.query({
            query: (params) => ({
                url: "/parent",
                params,
            }),
            providesTags: ["Parent"],
        }),

        getParentById: builder.query({
            query: (id) => `/parent/${id}`,
            providesTags: ["Parent"],
        }),

        updateParent: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/parent/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Parent"],
        }),

        updateParentStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/parent/${id}/status`,
                method: "PUT",
                body: { status },
            }),
            invalidatesTags: ["Parent"],
        })
    }),
});

export const {
    useGetParentsQuery,
    useGetParentByIdQuery,
    useUpdateParentMutation,
    useUpdateParentStatusMutation,
} = parentApi;



