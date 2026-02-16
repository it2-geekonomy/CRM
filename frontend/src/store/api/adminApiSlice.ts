import { apiSlice } from "./apiSlice";

/** Admin profile from GET /admin */
export type AdminProfile = {
  id: string;
  userId: string;
  name: string;
  bio: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdmins: builder.query<AdminProfile[], void>({
      query: () => ({ url: "/admin" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: "Admin" as const, id: a.id })),
              { type: "Admin", id: "LIST" },
            ]
          : [{ type: "Admin", id: "LIST" }],
    }),
  }),
});

export const { useGetAdminsQuery } = adminApiSlice;
