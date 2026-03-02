"use client";

import { useEffect, useState } from "react";
import DepartmentAccordion from "./components/DepartmentAccordion";
import { Configuration } from "./types";
import {
  useGetDepartmentsWithTaskTypesQuery,
  type DepartmentWithTaskTypesApi,
  type DepartmentTaskTypeApi,
} from "@/store/api/departmentApiSlice";

export default function ConfigPage() {
  const [departments, setDepartments] = useState<DepartmentWithTaskTypesApi[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: apiDepartments, isLoading, isError, error } = useGetDepartmentsWithTaskTypesQuery();

  useEffect(() => {
    if (apiDepartments) setDepartments(apiDepartments);
  }, [apiDepartments]);

  const toggleDept = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(departments.map((d) => d.id)));
  const collapseAll = () => setExpandedIds(new Set());

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const addConfiguration = (departmentId: string, config: Configuration) => {
    const newTaskType: DepartmentTaskTypeApi = {
      id: crypto.randomUUID(),
      name: config.name,
      description: config.description || undefined,
      billable: config.billable,
      slaHours: config.slaHours ? Number(config.slaHours) : undefined,
      status: config.status,
    };
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.id === departmentId
          ? { ...dept, taskTypes: [...(dept.taskTypes ?? []), newTaskType] }
          : dept
      )
    );
  };

  const deleteConfiguration = (departmentId: string, configId: string) => {
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.id === departmentId
          ? {
              ...dept,
              taskTypes: (dept.taskTypes ?? []).filter((tt) => tt.id !== configId),
            }
          : dept
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

        {/* Page Header */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-1">
          Configuration
        </h1>

        {/* Sub-header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 mb-4">
          <h2 className="text-sm sm:text-base font-semibold text-green-600">
            Departments
          </h2>

          {/* Action buttons — stack on mobile, row on sm+ */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={expandAll}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 transition whitespace-nowrap"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 transition whitespace-nowrap"
            >
              Collapse All
            </button>
            <button className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium whitespace-nowrap">
              + Add Department
            </button>
          </div>
        </div>

        {/* Loading / error */}
        {isLoading && (
          <div className="text-sm text-gray-500 py-4">Loading departments…</div>
        )}
        {isError && (
          <div className="text-sm text-red-600 py-4">
            Failed to load departments. {error && "data" in error && String((error as { data?: { message?: string } }).data?.message)}
          </div>
        )}

        {/* Department list */}
        <div className="space-y-3">
          {!isLoading && !isError && departments.map((dept, index) => (
            <DepartmentAccordion
              key={dept.id}
              department={dept}
              colorIndex={index}
              isExpanded={expandedIds.has(dept.id)}
              onToggle={() => toggleDept(dept.id)}
              onDelete={() => deleteDepartment(dept.id)}
              onAddConfiguration={addConfiguration}
              onDeleteConfiguration={deleteConfiguration}
            />
          ))}
        </div>

      </div>
    </div>
  );
}