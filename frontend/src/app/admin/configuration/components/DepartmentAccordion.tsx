"use client";

import { useState } from "react";
import { Department, Configuration } from "../types";
import ConfigModal from "./ConfigModal";
import ConfirmModal from "./ConfirmModal";

const DEPT_COLORS = [
  { bg: "bg-pink-500", text: "text-white" },
  { bg: "bg-purple-500", text: "text-white" },
  { bg: "bg-green-500", text: "text-white" },
  { bg: "bg-orange-400", text: "text-white" },
  { bg: "bg-blue-500", text: "text-white" },
  { bg: "bg-teal-500", text: "text-white" },
];

interface Task {
  id: string;
  name: string;
}

interface Props {
  department: Department;
  colorIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAddConfiguration: (departmentId: string, config: Configuration) => void;
  onDeleteConfiguration: (departmentId: string, configId: string) => void;
}

export default function DepartmentAccordion({
  department,
  colorIndex,
  isExpanded,
  onToggle,
  onDelete,
  onAddConfiguration,
  onDeleteConfiguration,
}: Props) {
  const [openModal, setOpenModal] = useState(false);
  const [confirmDeleteDept, setConfirmDeleteDept] = useState(false);
  const [confirmDeleteConfig, setConfirmDeleteConfig] = useState<string | null>(null);
  const [expandedConfigs, setExpandedConfigs] = useState<Set<string>>(new Set());
  const [configTasks, setConfigTasks] = useState<Record<string, Task[]>>({});
  const [addingTaskFor, setAddingTaskFor] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");

  const color = DEPT_COLORS[colorIndex % DEPT_COLORS.length];
  const configCount = department.configurations.length;
  const activeCount = department.configurations.filter((c) => c.status === "Active").length;
  const progressPercent = configCount > 0 ? Math.round((activeCount / configCount) * 100) : 0;

  const toggleConfig = (configId: string) => {
    setExpandedConfigs((prev) => {
      const next = new Set(prev);
      next.has(configId) ? next.delete(configId) : next.add(configId);
      return next;
    });
  };

  const handleAddTask = (configId: string) => {
    const name = newTaskName.trim();
    if (!name) return;
    setConfigTasks((prev) => ({
      ...prev,
      [configId]: [...(prev[configId] || []), { id: Date.now().toString(), name }],
    }));
    setNewTaskName("");
    setAddingTaskFor(null);
  };

  const handleDeleteTask = (configId: string, taskId: string) => {
    setConfigTasks((prev) => ({
      ...prev,
      [configId]: (prev[configId] || []).filter((t) => t.id !== taskId),
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

      {/* ── Department Header ── */}
      <div
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        {/* Color icon */}
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color.bg} ${color.text}`}>
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Name */}
        <span className="font-medium text-gray-800 flex-1 text-sm sm:text-base truncate">
          {department.name}
        </span>

        {/* Right side — stops propagation so clicks don't toggle accordion */}
        <div
          className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Config count — hidden on xs, visible sm+ */}
          <span className="hidden sm:inline text-xs text-gray-400 whitespace-nowrap">
            {configCount} {configCount === 1 ? "config" : "configs"}
          </span>

          {/* Progress bar — hidden on xs, visible md+ */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-20 lg:w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-8 text-right">{progressPercent}%</span>
          </div>

          {/* Delete button — icon only on mobile, icon+text on sm+ */}
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDeleteDept(true); }}
            className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 ml-1"
            aria-label="Delete department"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline text-xs font-medium">Delete</span>
          </button>
        </div>
      </div>

      {/* ── Department Body ── */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-3 sm:px-4 py-3 space-y-2 bg-gray-50/50">

          {/* Mobile-only: config count + progress */}
          {configCount > 0 && (
            <div className="flex items-center gap-2 mb-2 sm:hidden">
              <span className="text-xs text-gray-400">{configCount} {configCount === 1 ? "config" : "configs"}</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-xs text-gray-400">{progressPercent}%</span>
            </div>
          )}

          {configCount > 0 ? (
            department.configurations.map((config) => {
              const isConfigExpanded = expandedConfigs.has(config.id);
              const tasks = configTasks[config.id] || [];

              return (
                <div key={config.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden">

                  {/* Config Header */}
                  <div
                    className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                    onClick={() => toggleConfig(config.id)}
                  >
                    {/* Config chevron */}
                    <svg
                      className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isConfigExpanded ? "rotate-90" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>

                    {/* Config icon */}
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${color.bg} ${color.text}`}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {/* Config info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">{config.name}</div>
                      {/* Meta row — wraps gracefully on small screens */}
                      <div className="text-xs text-gray-400 flex flex-wrap items-center gap-x-1 gap-y-0.5 mt-0.5">
                        <span>SLA: {config.slaHours}h</span>
                        <span className="text-gray-300">•</span>
                        <span className={config.status === "Active" ? "text-green-500" : "text-gray-400"}>
                          {config.status}
                        </span>
                        {config.billable && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-blue-400">Billable</span>
                          </>
                        )}
                        {tasks.length > 0 && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>{tasks.length} task{tasks.length > 1 ? "s" : ""}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete config */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteConfig(config.id); }}
                      className="text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 flex-shrink-0 ml-1"
                      aria-label="Delete configuration"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline text-xs font-medium">Delete</span>
                    </button>
                  </div>

                  {/* ── Config Body: Tasks ── */}
                  {isConfigExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/60 px-3 sm:px-4 py-2 space-y-1.5">
                      {tasks.length > 0 ? (
                        tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between py-1.5 px-2 rounded-md bg-white border border-gray-100 group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.bg}`} />
                              <span className="text-sm text-gray-700 truncate">{task.name}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteTask(config.id, task.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 ml-2
                                         opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                              aria-label="Remove task"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 py-1 pl-1">No tasks yet. Add one below.</p>
                      )}

                      {/* Inline Add Task */}
                      {addingTaskFor === config.id ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                          <input
                            autoFocus
                            type="text"
                            placeholder="Task name..."
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddTask(config.id);
                              if (e.key === "Escape") { setAddingTaskFor(null); setNewTaskName(""); }
                            }}
                            className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-400"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddTask(config.id)}
                              className="flex-1 sm:flex-none px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => { setAddingTaskFor(null); setNewTaskName(""); }}
                              className="flex-1 sm:flex-none px-3 py-1.5 text-xs border border-gray-200 rounded-md hover:bg-gray-100 transition text-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => { setAddingTaskFor(config.id); setNewTaskName(""); }}
                            className="text-green-600 text-xs font-medium hover:text-green-700 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Task
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-400 py-3 text-center">No configurations yet</p>
          )}

          {/* Add Task Type */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => setOpenModal(true)}
              className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Task Type
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {openModal && (
        <ConfigModal
          department={department}
          onSubmit={(config) => { onAddConfiguration(department.id, config); }}
          onClose={() => setOpenModal(false)}
        />
      )}

      {confirmDeleteDept && (
        <ConfirmModal
          title="Delete Department"
          message={`Are you sure you want to delete "${department.name}"? This will also remove all its configurations.`}
          onConfirm={() => { onDelete(); setConfirmDeleteDept(false); }}
          onCancel={() => setConfirmDeleteDept(false)}
        />
      )}

      {confirmDeleteConfig && (
        <ConfirmModal
          title="Delete Configuration"
          message="Are you sure you want to delete this configuration?"
          onConfirm={() => { onDeleteConfiguration(department.id, confirmDeleteConfig); setConfirmDeleteConfig(null); }}
          onCancel={() => setConfirmDeleteConfig(null)}
        />
      )}
    </div>
  );
}