import {
    createApi,
    fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

export const admissionApi = createApi({
    reducerPath: "admissionApi",

    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        credentials: "include",
    }),

    tagTypes: ["Admissions"],

    endpoints: (builder) => ({
        postAdmission: builder.mutation({
            query: (formData) => ({
                url: "/admissions",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Admissions"],
        }),

        bulkUploadAdmission: builder.mutation({
            query: (file) => {
                const formData = new FormData();

                formData.append("file", file);

                return {
                    url: "/admissions/upload",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Admissions"],
        }),

    }),
});

export const {
    usePostAdmissionMutation,
    useBulkUploadAdmissionMutation,
} = admissionApi;