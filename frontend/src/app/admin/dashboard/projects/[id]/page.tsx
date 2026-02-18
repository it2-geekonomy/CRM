"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useState, useCallback } from "react";
import { useGetProjectQuery } from "@/store/api/projectApiSlice";
import type { TaskDepartment, CreateTaskFormData } from "./_components/taskTypes";
import { INITIAL_TASK_DEPARTMENTS, addTaskToDepartments, TASK_TYPE_TO_SUBSECTION } from "./_components/taskData";
import CreateTaskModal from "./_components/CreateTaskModal";
import TaskDepartmentList from "./_components/TaskDepartmentList";
import ProjectDocuments from "./_components/ProjectDocuments";

function formatDate(s: string | undefined): string {
  if (!s) return "—";
  const d = typeof s === "string" ? s.slice(0, 10) : "";
  if (!d) return "—";
  try {
    const [y, m, day] = d.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mi = parseInt(m || "0", 10) - 1;
    return `${months[mi] ?? m} ${day}, ${y}`;
  } catch {
    return d;
  }
}

export default function ProjectDetailPage() {
  const params = useParams();
  const idParam = params?.id;
  const projectId = Array.isArray(idParam) ? idParam?.[0] : idParam;

  const { data: project, isLoading, isError, error } = useGetProjectQuery(projectId ?? "", {
    skip: !projectId,
  });

  const [activeTab, setActiveTab] = useState("Project Info");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [departments, setDepartments] = useState<TaskDepartment[]>(INITIAL_TASK_DEPARTMENTS);

  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(INITIAL_TASK_DEPARTMENTS.map((d) => [d.name, true]))
  );
  const [expandedSubSections, setExpandedSubSections] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    INITIAL_TASK_DEPARTMENTS.forEach((d) =>
      d.subSections.forEach((s) => {
        map[`${d.name}::${s.name}`] = true;
      })
    );
    return map;
  });
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    INITIAL_TASK_DEPARTMENTS.forEach((d) =>
      d.subSections.forEach((s) =>
        s.tasks.filter((t) => t.isComplete).forEach((t) => ids.add(t.id))
      )
    );
    return ids;
  });

  const toggleTaskComplete = useCallback((taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const toggleDept = useCallback((name: string) => {
    setExpandedDepts((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const toggleSubSection = useCallback((dept: string, sub: string) => {
    const key = `${dept}::${sub}`;
    setExpandedSubSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const expandAll = useCallback(() => {
    setExpandedDepts(Object.fromEntries(departments.map((d) => [d.name, true])));
    const map: Record<string, boolean> = {};
    departments.forEach((d) =>
      d.subSections.forEach((s) => {
        map[`${d.name}::${s.name}`] = true;
      })
    );
    setExpandedSubSections(map);
  }, [departments]);

  const collapseAll = useCallback(() => {
    setExpandedDepts(Object.fromEntries(departments.map((d) => [d.name, false])));
    setExpandedSubSections({});
  }, [departments]);

  const handleCreateTask = useCallback((formData: CreateTaskFormData) => {
    const { departments: updated, newTaskId } = addTaskToDepartments(departments, {
      taskName: formData.taskName,
      department: formData.department,
      taskType: formData.taskType,
      assignTo: formData.assignTo,
      dueDate: formData.dueDate,
      status: formData.status,
    });
    setDepartments(updated);
    setExpandedDepts((p) => ({ ...p, [formData.department]: true }));
    const subSectionKey = TASK_TYPE_TO_SUBSECTION[formData.taskType] ?? formData.taskType;
    setExpandedSubSections((p) => ({ ...p, [`${formData.department}::${subSectionKey}`]: true }));
    if (formData.status === "Closed") {
      setCompletedTaskIds((p) => new Set([...p, newTaskId]));
    }
  }, [departments]);

  if (!projectId) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <p className="text-gray-600">Invalid project ID</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <p className="text-gray-600">Loading project…</p>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <p className="text-red-600">
          Failed to load project. {(error as { data?: { message?: string } })?.data?.message ?? "Please try again."}
        </p>
        <Link href="/admin/dashboard/projects" className="mt-4 text-green-600 hover:underline block">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
      {/* Fixed: Top Header + Breadcrumbs */}
      <div className="shrink-0 bg-gray-100 pt-6 pb-4">
        <div className="max-w-[1600px] mx-auto px-8">
          {/* Top Header - Single row with icons */}
          <div className="mb-4 pb-2 border-b border-gray-200">
          <div className="flex items-center gap-6 flex-nowrap overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setActiveTab("Project Info")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative shrink-0 ${
                activeTab === "Project Info" ? "text-green-600" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Project Info
              {activeTab === "Project Info" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" style={{ bottom: "-2px" }} />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsCreateTaskOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Task
            </button>
            <button
              type="button"
              onClick={() => toast.success("Task duplicated")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Duplicate Task
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-gray-500">Status:</span>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  project.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : project.status === "Completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {project.status}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("Project Documents")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative shrink-0 rounded-lg border ${
                activeTab === "Project Documents"
                  ? "text-green-600 border-gray-300 bg-white"
                  : "text-gray-700 hover:text-gray-900 border-transparent"
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Project Documents
              {activeTab === "Project Documents" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-b-lg" style={{ bottom: "-2px" }} />
              )}
            </button>

            <div className="flex items-center gap-6 flex-nowrap ml-auto shrink-0">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm text-gray-500">Owner:</span>
                <span className="text-sm font-medium text-gray-900">Arjun Sindhia</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500">Start:</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(project.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500">End:</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(project.endDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500">Client:</span>
                <span className="text-sm font-medium text-gray-900">ABC Corporation</span>
              </div>
            </div>
          </div>
          </div>

          {/* Breadcrumbs */}
          <div className="text-sm">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <span className="text-gray-400 mx-2">/</span>
            <Link href="/admin/dashboard/projects" className="text-gray-600 hover:text-gray-900">
              Projects
            </Link>
            <span className="text-gray-400 mx-2">/</span>
            <span className="text-green-600">{project.projectName}</span>
          </div>
        </div>
      </div>

      {/* Scrollable: Content */}
      <div className="scrollbar-hide flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-8 pb-10">
          {activeTab === "Project Documents" ? (
          <ProjectDocuments />
        ) : (
          <TaskDepartmentList
            departments={departments}
            expandedDepts={expandedDepts}
            expandedSubSections={expandedSubSections}
            completedTaskIds={completedTaskIds}
            projectId={projectId ?? ""}
            onToggleDept={toggleDept}
            onToggleSubSection={toggleSubSection}
            onToggleTaskComplete={toggleTaskComplete}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            onCreateTask={() => setIsCreateTaskOpen(true)}
          />
        )}
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}
