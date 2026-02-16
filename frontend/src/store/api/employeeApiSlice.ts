import { apiSlice } from "./apiSlice";

/** Query params for GET /employees (paginated, optional search/sort) */
export type EmployeeQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
};

/** Single employee from API (matches backend EmployeeProfile + user + department) */
export type Employee = {
  id: string;
  user: {
    id: string;
    email: string;
  };
  department: {
    id: string;
    name: string;
    code: string | null;
  };
  name: string;
  phone: string | null;
  alternatePhone: string | null;
  designation: string;
  employmentType: string;
  employmentStatus: string;
  dateOfJoining: string;
  dateOfExit: string | null;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EmployeesResponse = {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const employeeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<EmployeesResponse, EmployeeQueryParams | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params?.page != null) searchParams.set("page", String(params.page));
        if (params?.limit != null) searchParams.set("limit", String(params.limit));
        if (params?.search) searchParams.set("search", params.search);
        if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
        const qs = searchParams.toString();
        return { url: `/employees${qs ? `?${qs}` : ""}` };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((e) => ({ type: "Employee" as const, id: e.id })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
    }),
    getEmployee: builder.query<Employee, string>({
      query: (id) => ({ url: `/employees/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "Employee", id }],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useLazyGetEmployeesQuery,
  useGetEmployeeQuery,
} = employeeApiSlice;
