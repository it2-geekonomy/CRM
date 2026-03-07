import { apiSlice } from "./apiSlice";

/** Department as returned nested under project type from GET /project-types. */
export type ProjectTypeDepartmentApi = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  projectTypeId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectTypeApi = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  /** Departments assigned to this project type (from GET /project-types). */
  departments?: ProjectTypeDepartmentApi[];
};

export type ProjectTypesResponse = ProjectTypeApi[];
type ProjectTypesApiResponse = ProjectTypeApi[] | { data?: ProjectTypeApi[] };

/** Request body for POST /project-types (Create Project Type). */
export type CreateProjectTypeRequest = {
  name: string;
  departmentIds: string[];
  description?: string;
  isActive?: boolean;
};

/** Request body for PATCH /project-types/:id (Update Project Type). */
export type UpdateProjectTypeRequest = {
  name?: string;
  departmentIds?: string[];
  description?: string;
  isActive?: boolean;
};

export const projectTypeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjectTypes: builder.query<ProjectTypesResponse, void>({
      query: () => ({ url: "/project-types" }),
      transformResponse: (response: ProjectTypesApiResponse): ProjectTypesResponse =>
        Array.isArray(response) ? response : response?.data ?? [],
      providesTags: [{ type: "Project", id: "PROJECT_TYPES" }],
    }),
    createProjectType: builder.mutation<ProjectTypeApi, CreateProjectTypeRequest>({
      query: (body) => ({
        url: "/project-types",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Project", id: "PROJECT_TYPES" }],
    }),
    updateProjectType: builder.mutation<ProjectTypeApi, { id: string; body: UpdateProjectTypeRequest }>({
      query: ({ id, body }) => ({
        url: `/project-types/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Project", id: "PROJECT_TYPES" }],
    }),
    deleteProjectType: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/project-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Project", id: "PROJECT_TYPES" }],
    }),
  }),
});

export const {
  useGetProjectTypesQuery,
  useCreateProjectTypeMutation,
  useUpdateProjectTypeMutation,
  useDeleteProjectTypeMutation,
} = projectTypeApiSlice;
