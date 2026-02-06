import { apiSlice } from "./apiSlice";

/** Student profile for current user (backend: GET /students/me or similar) */
export type StudentProfile = {
  id: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export const studentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudentProfileMe: builder.query<StudentProfile, void>({
      query: () => ({ url: "/students/me" }),
    }),
  }),
});

export const { useLazyGetStudentProfileMeQuery, useGetStudentProfileMeQuery } =
  studentApiSlice;
