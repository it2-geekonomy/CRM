import { apiSlice } from "./apiSlice";

/** Admin Dashboard Stats Response */
export type AdminDashboardStats = {
  activeProjects: {
    value: number;
    delta: string;
  };
  tasksThisWeek: {
    value: number;
    delta: string;
  };
  hoursLogged: {
    value: string;
    delta: string;
  };
  teamMembers: {
    value: number;
    delta: string;
  };
};

export const adminDashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboardStats: builder.query<AdminDashboardStats, void>({
      query: () => ({ url: "/admin-dashboard/stats" }),
      providesTags: [{ type: "Project", id: "DASHBOARD_STATS" }],
    }),
  }),
});

export const { useGetAdminDashboardStatsQuery } = adminDashboardApiSlice;
