import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dashboardApi = createApi({
    reducerPath: "dashboardApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["Dashboard"],
    endpoints: (builder) => ({
        getDashboardOverview: builder.query({
            query: () => "/dashboard/overview",
            providesTags: ["Dashboard"],
        }),
    }),
});

export const { useGetDashboardOverviewQuery } = dashboardApi;
export default dashboardApi;
