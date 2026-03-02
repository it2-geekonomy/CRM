import { apiSlice } from "./apiSlice";

export type TaskTypeApi = {
  id: string;
  name: string;
  description?: string;
  department?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};


/** Payload for creating a task type (backend expects departmentId). */
export type CreateTaskTypeRequest = {
  name: string;
  description?: string;
  departmentId: string;
  billable?: boolean;
  slaHours?: number;
  status?: string;
};

export type TaskTypesResponse = TaskTypeApi[];
type TaskTypesApiResponse = TaskTypeApi[] | { data?: TaskTypeApi[] };

export const taskTypeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTaskType: builder.mutation<TaskTypeApi, CreateTaskTypeRequest>({
      query: (body) => ({
        url: "/task-types",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Task", id: "TASK_TYPES" }, { type: "Department", id: "LIST_WITH_TASK_TYPES" }],
    }),


    getTaskTypes: builder.query<TaskTypesResponse, void>({
      query: () => ({ url: "/task-types" }),
      transformResponse: (response: TaskTypesApiResponse): TaskTypesResponse =>
        Array.isArray(response) ? response : response?.data ?? [],
      providesTags: [{ type: "Task", id: "TASK_TYPES" }],
    }),
  }),
});

export const { useGetTaskTypesQuery, useCreateTaskTypeMutation } = taskTypeApiSlice;
