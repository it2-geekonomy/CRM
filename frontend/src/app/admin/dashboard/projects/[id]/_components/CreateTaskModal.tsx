"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useGetEmployeesQuery } from "@/store/api/employeeApiSlice";
import { useGetTaskTypesQuery } from "@/store/api/taskTypeApiSlice";
import type { CreateTaskFormData, TaskStatus, TaskPriority } from "./taskTypes";
import {
  DEPARTMENTS,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from "./taskTypes";

type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (data: CreateTaskFormData) => void;
};

const getInitialForm = (firstEmployeeName?: string, firstTaskType?: string): CreateTaskFormData => ({
  taskName: "",
  description: "",
  department: "Sales",
  taskType: firstTaskType || "",
  assignTo: firstEmployeeName || "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  status: "Open",
  priority: "Medium",
});

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreateTask,
}: CreateTaskModalProps) {
  // Fetch employees from API
  const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployeesQuery({ limit: 100 }, {
    refetchOnMountOrArgChange: true, // Force refetch when modal opens to ensure employees are available
  });

  // Fetch task types from API
  const { data: taskTypesData, isLoading: isLoadingTaskTypes } = useGetTaskTypesQuery(undefined, {
    refetchOnMountOrArgChange: true, // Force refetch when modal opens to ensure task types are available
  });

  // Get employees list for dropdown
  const employees = employeesData?.data || [];
  const firstEmployeeName = employees.length > 0 ? employees[0].name : "";

  const [form, setForm] = useState<CreateTaskFormData>(getInitialForm(firstEmployeeName));
  const [errors, setErrors] = useState<Partial<Record<keyof CreateTaskFormData, string>>>({});

  // Filter task types by department (matching department name)
  // If no match found, show all task types as fallback
  const taskTypes = useMemo(() => {
    if (!taskTypesData || taskTypesData.length === 0) return [];
    
    // Try to filter task types that belong to the selected department
    const filtered = taskTypesData
      .filter((tt) => tt.department?.name === form.department)
      .map((tt) => tt.name);
    
    // If no task types found for this department, show all available task types
    if (filtered.length === 0) {
      return taskTypesData.map((tt) => tt.name);
    }
    
    return filtered;
  }, [taskTypesData, form.department]);

  // Update form when employees and task types load and modal opens
  useEffect(() => {
    if (isOpen) {
      const updates: Partial<CreateTaskFormData> = {};
      
      if (employees.length > 0 && (!form.assignTo || !employees.some(emp => emp.name === form.assignTo))) {
        updates.assignTo = employees[0].name;
      }
      
      if (taskTypes.length > 0 && (!form.taskType || !taskTypes.includes(form.taskType))) {
        updates.taskType = taskTypes[0];
      }
      
      if (Object.keys(updates).length > 0) {
        setForm((prev) => ({ ...prev, ...updates }));
      }
    }
  }, [isOpen, employees, taskTypes, form.assignTo, form.taskType]);

  const handleDepartmentChange = useCallback((department: string) => {
    if (!taskTypesData) {
      setForm((prev) => ({
        ...prev,
        department,
        taskType: "",
      }));
      return;
    }

    // Filter task types for the selected department
    let types = taskTypesData
      .filter((tt) => tt.department?.name === department)
      .map((tt) => tt.name);
    
    // If no task types found for this department, use all available task types
    if (types.length === 0) {
      types = taskTypesData.map((tt) => tt.name);
    }
    
    const firstType = types[0] ?? "";
    setForm((prev) => ({
      ...prev,
      department,
      taskType: firstType,
    }));
  }, [taskTypesData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof CreateTaskFormData, string>> = {};
    if (!form.taskName.trim()) newErrors.taskName = "Task name is required";
    if (!form.startDate.trim()) newErrors.startDate = "Start date is required";
    if (!form.startTime.trim()) newErrors.startTime = "Start time is required";
    if (!form.endDate.trim()) newErrors.endDate = "End date is required";
    if (!form.endTime.trim()) newErrors.endTime = "End time is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onCreateTask(form);
    setForm(getInitialForm(firstEmployeeName, taskTypes[0]));
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setForm(getInitialForm(firstEmployeeName, taskTypes[0]));
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        onKeyDown={(e) => e.key === "Escape" && handleClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="create-task-title" className="text-xl font-semibold text-gray-900">
            Create New Task
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              id="taskName"
              type="text"
              value={form.taskName}
              onChange={(e) => setForm((p) => ({ ...p, taskName: e.target.value }))}
              placeholder="e.g. Homepage UI design"
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                errors.taskName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.taskName && <p className="mt-1 text-sm text-red-500">{errors.taskName}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Enter task description..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                id="department"
                value={form.department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="taskType" className="block text-sm font-medium text-gray-700 mb-1">
                Task Type
              </label>
              {isLoadingTaskTypes ? (
                <select
                  id="taskType"
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-500"
                >
                  <option>Loading task types...</option>
                </select>
              ) : taskTypes.length === 0 ? (
                <select
                  id="taskType"
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-700"
                >
                  <option>No task types available for this department</option>
                </select>
              ) : (
                <select
                  id="taskType"
                  value={form.taskType}
                  onChange={(e) => setForm((p) => ({ ...p, taskType: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                >
                  {taskTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="assignTo" className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            {isLoadingEmployees ? (
              <select
                id="assignTo"
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-500"
              >
                <option>Loading employees...</option>
              </select>
            ) : employees.length === 0 ? (
              <select
                id="assignTo"
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-red-300 bg-red-50 text-red-500"
              >
                <option>No employees available</option>
              </select>
            ) : (
              <select
                id="assignTo"
                value={form.assignTo}
                onChange={(e) => setForm((p) => ({ ...p, assignTo: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  placeholder="mm/dd/yyyy"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.startDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                  placeholder="--:-- --"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.startTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {errors.startTime && <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>}
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  placeholder="mm/dd/yyyy"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.endDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                  placeholder="--:-- --"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.endTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {errors.endTime && <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TaskStatus }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TaskPriority }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
