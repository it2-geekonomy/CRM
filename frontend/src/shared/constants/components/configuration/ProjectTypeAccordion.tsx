"use client";

import { useState } from "react";
import { ProjectType, Department } from "@/app/admin/configuration/types";
import ConfirmDialog from "./ConfirmDialog";

const PROJECT_COLORS = [
  { bg: "bg-green-500",   text: "text-white" },
  { bg: "bg-emerald-500", text: "text-white" },
  { bg: "bg-teal-500",    text: "text-white" },
  { bg: "bg-lime-500",    text: "text-white" },
  { bg: "bg-green-600",   text: "text-white" },
  { bg: "bg-emerald-600", text: "text-white" },
];

interface Props {
  projectType: ProjectType;
  allDepartments: Department[];
  colorIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAddDepartment: (projectId: string, department: Department) => void;
  onRemoveDepartment: (projectId: string, departmentId: string) => void;
}

export default function ProjectTypeAccordion({
  projectType,
  allDepartments,
  colorIndex,
  isExpanded,
  onToggle,
  onDelete,
  onAddDepartment,
  onRemoveDepartment,
}: Props) {
  // Confirm state for deleting the project type itself
  const [confirmDeleteType, setConfirmDeleteType] = useState(false);

  // Confirm state for removing a department — stores the dept to be removed
  const [confirmRemoveDept, setConfirmRemoveDept] = useState<Department | null>(null);

  const [showAddDept, setShowAddDept] = useState(false);

  const color = PROJECT_COLORS[colorIndex % PROJECT_COLORS.length];
  const deptList = projectType.departments ?? [];
  const deptCount = deptList.length;

  const availableDepartments = allDepartments.filter(
    (dept) => !deptList.some((d) => d.id === dept.id)
  );

  const handleAddDepartment = (departmentId: string) => {
    const deptToAdd = allDepartments.find((d) => d.id === departmentId);
    if (deptToAdd) {
      onAddDepartment(projectType.id, deptToAdd);
      setShowAddDept(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

      {/* ── Project Type Header ── */}
      <div
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-3 sm:py-4 cursor-pointer select-none hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        {/* Chevron */}
        <svg
          className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        {/* Color icon */}
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </div>

        {/* Name & Description */}
        <div className="flex-1 min-w-0">
          <span className="font-medium text-gray-800 text-sm sm:text-base block text-wrap">
            {projectType.name}
          </span>
          <span className="text-xs text-gray-400 block text-wrap">
            {projectType.description}
          </span>
          <span className="text-xs text-gray-500 sm:hidden mt-0.5 block">
            {deptCount} {deptCount === 1 ? "department" : "departments"}
          </span>
        </div>

        {/* Right side */}
        <div
          className="flex items-center gap-1 ml-auto shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="hidden sm:inline text-xs text-gray-400 whitespace-nowrap">
            {deptCount} {deptCount === 1 ? "department" : "departments"}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDeleteType(true); }}
            className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
            aria-label="Delete project type"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline text-xs font-medium">Delete</span>
          </button>
        </div>
      </div>

      {/* ── Project Type Body (Departments) ── */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-3 sm:px-4 md:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4 bg-gray-50/50">

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Configured Departments</h3>

            {deptCount > 0 ? (
              <div className="space-y-2">
                {deptList.map((dept) => (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${color.bg}`} />
                      <span className="text-sm text-gray-700 truncate">{dept.name}</span>
                    </div>

                    {/* ── Delete button (replaces the old × icon) ── */}
                    <button
                      onClick={() => setConfirmRemoveDept(dept)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors shrink-0 ml-2 text-xs font-medium"
                      title="Delete department"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-2">No departments assigned yet.</p>
            )}
          </div>

          {/* Add Department Section: show all available departments to select */}
          {showAddDept ? (
            <div className="space-y-3 p-3 bg-white border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700">
                Select a department to add to this project type
              </p>
              {availableDepartments.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {availableDepartments.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => handleAddDepartment(dept.id)}
                      className="w-full text-left px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-md hover:bg-green-50 hover:border-green-300 transition text-gray-800 font-medium"
                    >
                      + {dept.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-2">All departments are already assigned to this project type.</p>
              )}
              <button
                type="button"
                onClick={() => setShowAddDept(false)}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex justify-end pt-2 sm:pt-3">
              <button
                onClick={() => setShowAddDept(true)}
                className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Department
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Confirm: Delete project type ── */}
      {confirmDeleteType && (
        <ConfirmDialog
          title="Delete Project Type"
          message={`Are you sure you want to delete "${projectType.name}"? This action cannot be undone.`}
          onConfirm={() => { onDelete(); setConfirmDeleteType(false); }}
          onCancel={() => setConfirmDeleteType(false)}
        />
      )}

      {/* ── Confirm: Remove department from project type ── */}
      {confirmRemoveDept && (
        <ConfirmDialog
          title="Delete Department"
          message={`Are you sure you want to delete "${confirmRemoveDept.name}" from "${projectType.name}"?`}
          onConfirm={() => {
            onRemoveDepartment(projectType.id, confirmRemoveDept.id);
            setConfirmRemoveDept(null);
          }}
          onCancel={() => setConfirmRemoveDept(null)}
        />
      )}
    </div>
  );
}