"use client";

import { useState } from "react";
import type { CreateProjectTypeRequest } from "@/store/api/projectTypeApiSlice";

interface Props {
  departments: { id: string; name: string }[];
  onSubmit: (body: CreateProjectTypeRequest) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export default function CreateProjectTypeModal({
  departments,
  onSubmit,
  onClose,
  isSubmitting = false,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentIds, setDepartmentIds] = useState<Set<string>>(new Set());
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; departmentIds?: string }>({});

  const toggleDepartment = (id: string) => {
    setDepartmentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (errors.departmentIds) setErrors((e) => ({ ...e, departmentIds: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; departmentIds?: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (departmentIds.size === 0) newErrors.departmentIds = "Select at least one department";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit({
      name: name.trim(),
      departmentIds: Array.from(departmentIds),
      description: description.trim() || undefined,
      isActive,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full relative rounded-t-2xl sm:rounded-2xl shadow-xl sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full sm:hidden" />

        <div className="flex items-center justify-between px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Add Project Type</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none p-1 -mr-1 disabled:opacity-50"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-7 py-5 sm:py-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label htmlFor="project-type-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="project-type-name"
              type="text"
              value={name}
              onChange={(ev) => { setName(ev.target.value); if (errors.name) setErrors((prev) => ({ ...prev, name: undefined })); }}
              placeholder="e.g. Enterprise ERP"
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${errors.name ? "border-red-500" : "border-gray-300"}`}
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="project-type-desc" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              id="project-type-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. High-level business systems"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Departments <span className="text-red-500">*</span>
            </span>
            {departments.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No departments available. Add departments first.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {departments.map((dept) => (
                  <label key={dept.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={departmentIds.has(dept.id)}
                      onChange={() => toggleDepartment(dept.id)}
                      disabled={isSubmitting}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-800">{dept.name}</span>
                  </label>
                ))}
              </div>
            )}
            {errors.departmentIds && <p className="mt-1 text-sm text-red-500">{errors.departmentIds}</p>}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isSubmitting}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || departments.length === 0}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSubmitting ? "Creating…" : "Create Project Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
