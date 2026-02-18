"use client";

import Link from "next/link";
import type { TaskDepartment, TaskStatus } from "./taskTypes";

function getStatusStyles(status: TaskStatus): string {
  switch (status) {
    case "Closed":
      return "bg-green-100 text-green-700";
    case "In Progress":
      return "bg-amber-100 text-amber-700";
    case "On-Hold":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

type TaskDepartmentListProps = {
  departments: TaskDepartment[];
  expandedDepts: Record<string, boolean>;
  expandedSubSections: Record<string, boolean>;
  completedTaskIds: Set<string>;
  onToggleDept: (name: string) => void;
  onToggleSubSection: (dept: string, sub: string) => void;
  onToggleTaskComplete: (taskId: string, e: React.MouseEvent) => void;
  projectId: string;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onCreateTask: () => void;
};

export default function TaskDepartmentList({
  departments,
  expandedDepts,
  expandedSubSections,
  completedTaskIds,
  onToggleDept,
  onToggleSubSection,
  onToggleTaskComplete,
  projectId,
  onExpandAll,
  onCollapseAll,
  onCreateTask,
}: TaskDepartmentListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExpandAll}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={onCollapseAll}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            Collapse All
          </button>
          <button
            type="button"
            onClick={onCreateTask}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
          >
            + Create Task
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {departments.map((dept) => {
          const isDeptExpanded = expandedDepts[dept.name] ?? true;
          // Calculate dynamic progress based on completedTaskIds
          const allTasksInDept = dept.subSections.flatMap((sub) => sub.tasks);
          const totalTasks = allTasksInDept.length;
          const completedTasks = allTasksInDept.filter((task) => completedTaskIds.has(task.id)).length;
          const calculatedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          const displayTaskCount = totalTasks || dept.taskCount;
          const displayProgress = totalTasks > 0 ? calculatedProgress : dept.progress;
          return (
            <div
              key={dept.name}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <button
                type="button"
                onClick={() => onToggleDept(dept.name)}
                className="w-full flex items-center gap-4 p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <svg
                  className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${isDeptExpanded ? "" : "-rotate-90"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <div className={`w-9 h-9 ${dept.color} rounded-lg flex items-center justify-center shrink-0`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 flex-1 min-w-0">{dept.name}</h3>
                <div className="flex items-center gap-3 shrink-0 ml-auto">
                  <span className="px-2.5 py-1 rounded-full text-sm text-gray-700 bg-gray-100">
                    {displayTaskCount} tasks
                  </span>
                  <div className="w-24 min-w-[80px] max-w-[200px] bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${dept.progressColor}`}
                      style={{ width: `${displayProgress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-9 text-right">{displayProgress}%</span>
                </div>
              </button>

              {isDeptExpanded && (
                <div className="border-t border-gray-100 px-6 pb-6 pt-2">
                  {dept.subSections.map((sub) => {
                    const subKey = `${dept.name}::${sub.name}`;
                    const isSubExpanded = expandedSubSections[subKey] ?? true;
                    return (
                      <div key={subKey} className="mt-4 first:mt-0">
                        <button
                          type="button"
                          onClick={() => onToggleSubSection(dept.name, sub.name)}
                          className="w-full flex items-center gap-3 py-3 text-left hover:bg-gray-50 rounded-lg -mx-2 px-2 transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isSubExpanded ? "" : "-rotate-90"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">{sub.name}</span>
                          <span className="text-sm text-gray-500">{sub.tasks.length} tasks</span>
                        </button>

                        {isSubExpanded && (
                          <div className="mt-1 space-y-1">
                                {sub.tasks.map((task, idx) => {
                              const isComplete = completedTaskIds.has(task.id);
                              return (
                                <Link
                                  key={task.id}
                                  href={`/admin/dashboard/projects/${projectId}/tasks/${task.id}`}
                                  onClick={() => {
                                    if (typeof window !== "undefined") {
                                      sessionStorage.setItem("crm_selected_task", JSON.stringify(task));
                                    }
                                  }}
                                  className="w-full flex items-center gap-4 py-3 px-4 rounded-lg text-left transition-colors hover:bg-green-50/50"
                                >
                                  <span className="text-sm text-gray-500 w-6">{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      onToggleTaskComplete(task.id, e);
                                    }}
                                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:ring-2 hover:ring-green-400 hover:ring-offset-1 transition-all focus:outline-none focus:ring-0"
                                    aria-label={isComplete ? "Mark incomplete" : "Mark complete"}
                                  >
                                    {isComplete ? (
                                      <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                        <svg className="w-3 h-3 text-white shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </span>
                                    ) : (
                                      <span className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-green-400 shrink-0 box-border" />
                                    )}
                                  </button>
                                  <span className={`flex-1 text-sm ${isComplete ? "text-gray-500 line-through" : "text-gray-900"}`}>
                                    {task.description}
                                  </span>
                                  <div
                                    className={`w-8 h-8 rounded-full ${task.assigneeColor} text-white flex items-center justify-center text-xs font-medium shrink-0`}
                                  >
                                    {task.assignee.initials}
                                  </div>
                                  <span className="text-sm text-gray-600 shrink-0">{task.assignee.name}</span>
                                  <span
                                    className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 ${getStatusStyles(task.status)}`}
                                  >
                                    {task.status}
                                  </span>
                                  <span className="text-sm text-gray-500 shrink-0">{task.date}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
