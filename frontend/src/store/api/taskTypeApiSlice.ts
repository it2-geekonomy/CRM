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

export type TaskTypesResponse = TaskTypeApi[];
type TaskTypesApiResponse = TaskTypeApi[] | { data?: TaskTypeApi[] };

export const taskTypeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTaskTypes: builder.query<TaskTypesResponse, void>({
      query: () => ({ url: "/task-types" }),
      transformResponse: (response: TaskTypesApiResponse): TaskTypesResponse =>
        Array.isArray(response) ? response : response?.data ?? [],
      providesTags: [{ type: "Task", id: "TASK_TYPES" }],
    }),
  }),
});

export const { useGetTaskTypesQuery } = taskTypeApiSlice;
