import { apiSlice } from "./apiSlice";

/** Backend TaskStatus enum values */
export type BackendTaskStatus = "IN_PROGRESS" | "ON_HOLD" | "REVIEW" | "ADDRESSED" | "OVERDUE";

/** Frontend TaskStatus values */
export type FrontendTaskStatus = "Closed" | "In Progress" | "Open" | "On-Hold";

/** Map backend status to frontend status */
export function mapBackendToFrontendStatus(status: BackendTaskStatus): FrontendTaskStatus {
  const statusMap: Record<BackendTaskStatus, FrontendTaskStatus> = {
    IN_PROGRESS: "In Progress",
    ON_HOLD: "On-Hold",
    REVIEW: "In Progress",
    ADDRESSED: "Closed",
    OVERDUE: "On-Hold",
  };
  return statusMap[status] || "Open";
}

/** Map frontend status to backend status */
export function mapFrontendToBackendStatus(status: FrontendTaskStatus): BackendTaskStatus {
  const statusMap: Record<FrontendTaskStatus, BackendTaskStatus> = {
    "In Progress": "IN_PROGRESS",
    "On-Hold": "ON_HOLD",
    "Closed": "ADDRESSED",
    "Open": "IN_PROGRESS",
  };
  return statusMap[status] || "IN_PROGRESS";
}

/** Task as returned by backend API (TypeORM QueryBuilder getRawMany format with explicit aliases)
 * Backend now uses camelCase aliases, but PostgreSQL may lowercase them
 * So we support both camelCase and lowercase versions
 */
export type TaskApi = {
  task_id: string;
  // camelCase aliases (from backend explicit aliases)
  task_taskName?: string;
  task_taskDescription?: string;
  task_taskStatus?: BackendTaskStatus;
  task_startDate?: string;
  task_startTime?: string;
  task_endDate?: string;
  task_endTime?: string;
  task_createdAt?: string;
  task_updatedAt?: string;
  assignedTo_id?: string;
  assignedTo_name?: string;
  assignedTo_designation?: string;
  assignedBy_id?: string;
  assignedBy_name?: string;
  project_projectId?: string;
  project_projectName?: string;
  // lowercase versions (PostgreSQL fallback - may lowercase aliases)
  task_taskname?: string;
  task_taskdescription?: string;
  task_taskstatus?: BackendTaskStatus;
  task_startdate?: string;
  task_starttime?: string;
  task_enddate?: string;
  task_endtime?: string;
  task_createdat?: string;
  task_updatedat?: string;
  assignedto_id?: string;
  assignedto_name?: string;
  assignedto_designation?: string;
  assignedby_id?: string;
  assignedby_name?: string;
  project_projectid?: string;
  project_projectname?: string;
  [key: string]: any; // Allow for any other fields
};

/** Query params for GET /tasks */
export type TaskQueryParams = {
  projectId?: string;
};

/** Body for POST /tasks (CreateTaskDto) */
export type CreateTaskBody = {
  taskName: string;
  taskDescription?: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  assignedToId: string; // Employee UUID
  projectId: string; // Project UUID
};

/** Body for PATCH /tasks/:id */
export type UpdateTaskBody = {
  taskName?: string;
  taskDescription?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  assignedToId?: string;
};

/** Body for PATCH /tasks/:id/status */
export type UpdateTaskStatusBody = {
  newStatus: BackendTaskStatus;
  changeReason?: string;
};

/** Checklist item from backend */
export type ChecklistItemApi = {
  id: string;
  itemName: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Body for POST /tasks/:id/checklist */
export type CreateChecklistItemBody = {
  itemName: string;
};

/** Body for PATCH /tasks/:id/checklist/:itemId */
export type UpdateChecklistItemBody = {
  itemName?: string;
  isCompleted?: boolean;
};

export type TasksResponse = TaskApi[];

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<TasksResponse, TaskQueryParams | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params?.projectId) searchParams.set("projectId", params.projectId);
        const qs = searchParams.toString();
        return { url: `/tasks${qs ? `?${qs}` : ""}` };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Task" as const, id: t.task_id })),
              { type: "Task", id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],
    }),
    getTask: builder.query<TaskApi, string>({
      query: (id) => ({ url: `/tasks/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "Task", id }],
    }),
    createTask: builder.mutation<{ id: string; taskName: string; taskStatus: BackendTaskStatus; createdAt: string }, CreateTaskBody>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),
    updateTask: builder.mutation<{ id: string; taskName: string; taskStatus: BackendTaskStatus; updatedAt: string }, { id: string; body: UpdateTaskBody }>({
      query: ({ id, body }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [{ type: "Task", id }, { type: "Task", id: "LIST" }],
    }),
    updateTaskStatus: builder.mutation<
      { taskId: string; oldStatus: BackendTaskStatus; newStatus: BackendTaskStatus; changedAt: string; changedBy: { id: string; name: string } },
      { id: string; body: UpdateTaskStatusBody }
    >({
      query: ({ id, body }) => ({
        url: `/tasks/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [{ type: "Task", id }, { type: "Task", id: "LIST" }],
    }),
    deleteTask: builder.mutation<{ statusCode: number; message: string }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => [{ type: "Task", id }, { type: "Task", id: "LIST" }],
    }),
    // Checklist endpoints
    getChecklist: builder.query<ChecklistItemApi[], string>({
      query: (taskId) => ({ url: `/tasks/${taskId}/checklist` }),
      providesTags: (_result, _err, taskId) => [{ type: "Task", id: taskId }, { type: "Task", id: `${taskId}-checklist` }],
    }),
    createChecklistItem: builder.mutation<ChecklistItemApi, { taskId: string; body: CreateChecklistItemBody }>({
      query: ({ taskId, body }) => ({
        url: `/tasks/${taskId}/checklist`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { taskId }) => [{ type: "Task", id: taskId }, { type: "Task", id: `${taskId}-checklist` }],
    }),
    updateChecklistItem: builder.mutation<ChecklistItemApi, { taskId: string; itemId: string; body: UpdateChecklistItemBody }>({
      query: ({ taskId, itemId, body }) => ({
        url: `/tasks/${taskId}/checklist/${itemId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { taskId }) => [{ type: "Task", id: taskId }, { type: "Task", id: `${taskId}-checklist` }],
    }),
    deleteChecklistItem: builder.mutation<{ message: string }, { taskId: string; itemId: string }>({
      query: ({ taskId, itemId }) => ({
        url: `/tasks/${taskId}/checklist/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { taskId }) => [{ type: "Task", id: taskId }, { type: "Task", id: `${taskId}-checklist` }],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useLazyGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useGetChecklistQuery,
  useCreateChecklistItemMutation,
  useUpdateChecklistItemMutation,
  useDeleteChecklistItemMutation,
} = taskApiSlice;
