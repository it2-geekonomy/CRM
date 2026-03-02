import { apiSlice } from "./apiSlice";

/** Task type as returned by GET /departments?include=taskTypes */
export type DepartmentTaskTypeApi = {
  id: string;
  name: string;
  description?: string;
  billable: boolean;
  slaHours?: number;
  status: string;
};

/** Department with nested task types (single optimal API call). */
export type DepartmentWithTaskTypesApi = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  taskTypes: DepartmentTaskTypeApi[];
};

export type DepartmentsWithTaskTypesResponse = DepartmentWithTaskTypesApi[];
type RawResponse = DepartmentsWithTaskTypesResponse | { data?: DepartmentsWithTaskTypesResponse };

export const departmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartmentsWithTaskTypes: builder.query<DepartmentsWithTaskTypesResponse, void>({
      query: () => ({ url: "/departments/list/with-task-types" }),
      transformResponse: (response: RawResponse): DepartmentsWithTaskTypesResponse =>
        Array.isArray(response) ? response : response?.data ?? [],
      providesTags: [{ type: "Department", id: "LIST_WITH_TASK_TYPES" }],
    }),
  }),
});

export const { useGetDepartmentsWithTaskTypesQuery } = departmentApiSlice;
