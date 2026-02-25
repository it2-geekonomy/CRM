import { apiSlice } from "./apiSlice";

export type ProjectTypeApi = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectTypesResponse = ProjectTypeApi[];
type ProjectTypesApiResponse = ProjectTypeApi[] | { data?: ProjectTypeApi[] };

export const projectTypeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjectTypes: builder.query<ProjectTypesResponse, void>({
      query: () => ({ url: "/project-types" }),
      transformResponse: (response: ProjectTypesApiResponse): ProjectTypesResponse =>
        Array.isArray(response) ? response : response?.data ?? [],
      providesTags: [{ type: "Project", id: "PROJECT_TYPES" }],
    }),
  }),
});

export const { useGetProjectTypesQuery } = projectTypeApiSlice;
