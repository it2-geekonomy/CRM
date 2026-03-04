/**
 * Local component types for configuration page
 * API types are defined in src/store/api/departmentApiSlice.ts and projectTypeApiSlice.ts
 */

export type TaskStatus = "Active" | "Inactive";

/**
 * Local form data type for creating/updating task types
 * Maps to CreateTaskTypeDto in API
 */
export interface TaskTypeFormData {
  name: string;
  description?: string;
  billable: boolean;
  slaHours: string;
  status: TaskStatus;
}

/**
 * @deprecated Use DepartmentWithTaskTypesApi from departmentApiSlice instead
 */
export interface Department {
  id: string;
  name: string;
  configurations: any[];
}

/**
 * @deprecated Use ProjectTypeApi from projectTypeApiSlice instead
 */
export interface ProjectType {
  id: string;
  name: string;
  description: string;
  departments: any[];
}
