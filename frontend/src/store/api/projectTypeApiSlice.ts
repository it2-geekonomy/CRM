import { apiSlice } from "./apiSlice";

/** Department as nested in project type (from GET /project-types with relations). */
export type ProjectTypeDepartmentApi = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  projectTypeId: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectTypeApi = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  departments?: ProjectTypeDepartmentApi[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type ProjectTypesResponse = ProjectTypeApi[];
type ProjectTypesApiResponse = ProjectTypeApi[] | { data?: ProjectTypeApi[] };

export const projectTypeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createProjectType: builder.mutation<ProjectTypeApi, CreateProjectTypeBody>({
      query: (body) => ({
        url: "/project-types",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Project", id: "PROJECT_TYPES" }],
    }),

    getProjectTypes: builder.query<ProjectTypesResponse, void>({
      query: () => ({ url: "/project-types" }),
      transformResponse: (response: ProjectTypesApiResponse): ProjectTypesResponse =>
        Array.isArray(response) ? response : response?.data ?? [],
      providesTags: [{ type: "Project", id: "PROJECT_TYPES" }],
    }),
  }),
});

export const { useGetProjectTypesQuery } = projectTypeApiSlice;
