"use client";

import { useState, useCallback } from "react";
import type { CreateTaskFormData, TaskStatus, TaskPriority } from "./taskTypes";
import {
  DEPARTMENTS,
  TASK_TYPES_BY_DEPARTMENT,
  ASSIGNEES,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from "./taskTypes";

type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (data: CreateTaskFormData) => void;
};

const initialForm: CreateTaskFormData = {
  taskName: "",
  department: "Sales",
  taskType: "Lead Qualification",
  assignTo: "Arjun Sindhia",
  dueDate: "",
  status: "Open",
  priority: "Medium",
};

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreateTask,
}: CreateTaskModalProps) {
  const [form, setForm] = useState<CreateTaskFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateTaskFormData, string>>>({});

  const taskTypes = TASK_TYPES_BY_DEPARTMENT[form.department] ?? TASK_TYPES_BY_DEPARTMENT.Sales ?? [];

  const handleDepartmentChange = useCallback((department: string) => {
    const types = TASK_TYPES_BY_DEPARTMENT[department] ?? [];
    const firstType = types[0] ?? "";
    setForm((prev) => ({
      ...prev,
      department,
      taskType: firstType,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof CreateTaskFormData, string>> = {};
    if (!form.taskName.trim()) newErrors.taskName = "Task name is required";
    if (!form.dueDate.trim()) newErrors.dueDate = "Due date is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onCreateTask(form);
    setForm(initialForm);
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setForm(initialForm);
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
            </div>
          </div>

          <div>
            <label htmlFor="assignTo" className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            <select
              id="assignTo"
              value={form.assignTo}
              onChange={(e) => setForm((p) => ({ ...p, assignTo: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
            >
              {ASSIGNEES.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                errors.dueDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.dueDate && <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>}
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
