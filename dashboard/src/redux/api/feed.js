import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const feedApi = createApi({
    reducerPath: "feedApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["Feed"],
    endpoints: (builder) => ({
        getAllFeedPost: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => ({
                url: "/feed",
                params: { page, limit },
            }),
            providesTags: ["Feed"],
        }),

        getFeedPostById: builder.query({
            query: (id) => `/feed/${id}`,
            providesTags: ["Feed"],
        }),

        createFeedPost: builder.mutation({
            query: (formData) => ({
                url: "/feed",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Feed"],
        }),

        updateFeedPost: builder.mutation({
            query: ({ feedId, formData }) => ({
                url: `/feed/${feedId}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Feed"],
        }),

        deleteFeedPost: builder.mutation({
            query: (feedId) => ({
                url: `/feed/${feedId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Feed"],
        }),

        pinFeedPost: builder.mutation({
            query: (feedId) => ({
                url: `/feed/${feedId}/pin`,
                method: "PUT",
            }),
            invalidatesTags: ["Feed"],
        }),

        unpinFeedPost: builder.mutation({
            query: (feedId) => ({
                url: `/feed/${feedId}/unpin`,
                method: "PUT",
            }),
            invalidatesTags: ["Feed"],
        }),
    }),
});

export const {
    useGetAllFeedPostQuery,
    useGetFeedPostByIdQuery,
    useCreateFeedPostMutation,
    useUpdateFeedPostMutation,
    useDeleteFeedPostMutation,
    usePinFeedPostMutation,
    useUnpinFeedPostMutation,
} = feedApi;
