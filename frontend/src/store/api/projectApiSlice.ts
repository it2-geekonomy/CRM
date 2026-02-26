import { apiSlice } from "./apiSlice";

/** Backend ProjectStatus enum values */
export type ProjectStatus = "Draft" | "Active" | "Completed" | "Archived";

/** Backend ProjectType enum values */
export type ProjectType = "Website" | "App" | "CRM" | "Internal";

/** Query params for GET /projects */
export type ProjectQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  type?: ProjectType;
  managerId?: string;
  fromDate?: string;
  toDate?: string;
  isArchived?: boolean;
  sortOrder?: "ASC" | "DESC";
};

/** Body for POST /projects (CreateProjectDto) */
export type CreateProjectBody = {
  name: string;
  code?: string;
  projectTypeId: string; // Backend expects UUID, not enum string
  clientId?: string; // Backend expects UUID, not name string
  description?: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  estimatedHours?: number;
  projectManagerId: string;
  projectLeadId: string;
  requireTimeTracking?: boolean;
};

/** Project as returned by API */
export type ProjectApi = {
  id: string;
  name: string;
  code: string;
  type: ProjectType;
  description?: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  estimatedHours?: number;
  projectManagerId: string;
  projectLeadId: string;
  requireTimeTracking: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

export type ProjectsResponse = {
  data: ProjectApi[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
};

export const projectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<ProjectsResponse, ProjectQueryParams | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params?.page != null) searchParams.set("page", String(params.page));
        if (params?.limit != null) searchParams.set("limit", String(params.limit));
        if (params?.search) searchParams.set("search", params.search);
        if (params?.status) searchParams.set("status", params.status);
        if (params?.type) searchParams.set("type", params.type);
        if (params?.managerId) searchParams.set("managerId", params.managerId);
        if (params?.fromDate) searchParams.set("fromDate", params.fromDate);
        if (params?.toDate) searchParams.set("toDate", params.toDate);
        if (params?.isArchived != null) searchParams.set("isArchived", String(params.isArchived));
        if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
        const qs = searchParams.toString();
        return { url: `/projects${qs ? `?${qs}` : ""}` };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((p) => ({ type: "Project" as const, id: p.id })),
              { type: "Project", id: "LIST" },
            ]
          : [{ type: "Project", id: "LIST" }],
    }),
    getProject: builder.query<ProjectApi, string>({
      query: (id) => ({ url: `/projects/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "Project", id }],
    }),
    createProject: builder.mutation<ProjectApi, CreateProjectBody>({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useLazyGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
} = projectApiSlice;
