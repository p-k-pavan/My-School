import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["User"],

    endpoints: (builder) => ({
        login: builder.mutation({
            query: (formData) => ({
                url: "/auth/login",
                method: "POST",
                body: formData,
            }),
        }),

        logout: builder.mutation({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation
} = authApi;