import { apiSlice } from "../slices/ApiSlice";

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query<any, void>({
      query: ({ timePeriod, year, startDate, endDate }: any) => ({
        url: "/analytics/overview",
        method: "GET",
        credentials: "include",
        params: {
          timePeriod,
          ...(year && { year }),
          ...(startDate && endDate && { startDate, endDate }),
        },
      }),
    }),

    getYearRange: builder.query<any, void>({
      query: () => ({
        url: "/analytics/year-range",
        method: "GET",
      }),
    }),

    getProductPerformance: builder.query<any, void>({
      query: ({ timePeriod, year, startDate, endDate }: any) => ({
        url: "/analytics/products",
        method: "GET",
        credentials: "include",
        params: {
          timePeriod,
          ...(year && { year }),
          ...(startDate && endDate && { startDate, endDate }),
        },
      }),
    }),

    getCustomerAnalytics: builder.query<any, void>({
      query: ({ timePeriod, year, startDate, endDate }: any) => ({
        url: "/analytics/customers",
        method: "GET",
        credentials: "include",
        params: {
          timePeriod,
          ...(year && { year }),
          ...(startDate && endDate && { startDate, endDate }),
        },
      }),
    }),

    getInteractionAnalytics: builder.query<any, void>({
      query: ({ timePeriod, year, startDate, endDate }: any) => ({
        url: "/analytics/interactions",
        method: "GET",
        credentials: "include",
        params: {
          timePeriod,
          ...(year && { year }),
          ...(startDate && endDate && { startDate, endDate }),
        },
      }),
    }),

    recordInteraction: builder.mutation<any, Record<string, any>>({
      query: (interactionData) => ({
        url: "/analytics/interactions",
        method: "POST",
        body: interactionData,
      }),
    }),

    exportAnalytics: builder.query<Blob, void>({
      query: () => ({
        url: "/analytics/export",
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetYearRangeQuery,
  useGetProductPerformanceQuery,
  useGetCustomerAnalyticsQuery,
  useGetInteractionAnalyticsQuery,
  useRecordInteractionMutation,
  useExportAnalyticsQuery,
} = analyticsApi;
