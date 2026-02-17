"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useState, useCallback, useEffect, useRef } from "react";
import { useGetProjectQuery } from "@/store/api/projectApiSlice";
import type { Task, TaskStatus } from "../../_components/taskTypes";
import { INITIAL_TASK_DEPARTMENTS, getTaskById } from "../../_components/taskData";

type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

type Timestamp = {
  id: string;
  dateTime: string;
  note: string;
};

function formatTimestamp(date: Date): string {
  const d = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const t = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${d} at ${t}`;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "c1", label: "Review design direction and moodboard", completed: false },
  { id: "c2", label: "Create desktop wireframe (1920px)", completed: true },
  { id: "c3", label: "Create tablet wireframe (768px)", completed: true },
  { id: "c4", label: "Create mobile wireframe (375px)", completed: false },
  { id: "c5", label: "Design hero section with call-to-action", completed: false },
  { id: "c6", label: "Design services section with icons", completed: false },
  { id: "c7", label: "Design testimonials carousel", completed: false },
  { id: "c8", label: "Design footer with contact information", completed: false },
  { id: "c9", label: "Export all assets and components", completed: false },
  { id: "c10", label: "Prepare developer handoff documentation", completed: false },
];

const DEFAULT_DESCRIPTION =
  "Create pixel-perfect homepage UI design for all breakpoints (desktop, tablet, mobile). Ensure design follows the approved moodboard and style guide. Include all interactive states for buttons, forms, and navigation elements. Design should be responsive and optimized for handoff to frontend developers using Figma's developer mode.";

const DEFAULT_DELIVERABLES = [
  "Figma file with all breakpoints (1920px, 1440px, 768px, 375px)",
  "Component library for reusable elements",
  "Design system documentation",
  "Exported assets (SVG, PNG as needed)",
];

const TASK_STORAGE_KEY = "crm_selected_task";

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

function getTaskFromStorage(taskId: string): Task | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(TASK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.id === taskId) return parsed as Task;
  } catch {
    // ignore
  }
  return null;
}

export default function TaskDetailPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const taskId = Array.isArray(params?.taskId) ? params.taskId[0] : params?.taskId;

  const { data: project } = useGetProjectQuery(projectId ?? "", { skip: !projectId });

  const [task, setTask] = useState<Task | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskLabel, setNewSubtaskLabel] = useState("");
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [isAddingTimestamp, setIsAddingTimestamp] = useState(false);
  const [newTimestampNote, setNewTimestampNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!taskId) return;
    const fromStorage = getTaskFromStorage(taskId);
    if (fromStorage) {
      setTask(fromStorage);
      sessionStorage.removeItem(TASK_STORAGE_KEY);
      return;
    }
    const found = getTaskById(INITIAL_TASK_DEPARTMENTS, taskId);
    setTask(found);
  }, [taskId]);

  const toggleChecklistItem = useCallback((id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  }, []);

  const startAddingSubtask = useCallback(() => {
    setIsAddingSubtask(true);
    setNewSubtaskLabel("");
  }, []);

  const addChecklistItem = useCallback(() => {
    const label = newSubtaskLabel.trim() || "New subtask";
    setChecklist((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, label, completed: false },
    ]);
    setNewSubtaskLabel("");
    setIsAddingSubtask(false);
  }, [newSubtaskLabel]);

  const cancelAddingSubtask = useCallback(() => {
    setIsAddingSubtask(false);
    setNewSubtaskLabel("");
  }, []);

  const addTimestamp = useCallback(() => {
    const now = new Date();
    setTimestamps((prev) => [
      ...prev,
      {
        id: `ts-${Date.now()}`,
        dateTime: formatTimestamp(now),
        note: newTimestampNote.trim(),
      },
    ]);
    setNewTimestampNote("");
    setIsAddingTimestamp(false);
  }, [newTimestampNote]);

  const cancelAddingTimestamp = useCallback(() => {
    setIsAddingTimestamp(false);
    setNewTimestampNote("");
  }, []);

  const handleAddFilesClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // TODO: integrate with backend API when ready
      const count = files.length;
      toast.success(count === 1 ? "1 file selected" : `${count} files selected`);
      e.target.value = "";
    }
  }, []);

  if (!taskId || !projectId) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <p className="text-gray-600">Invalid URL</p>
        <Link href={`/admin/dashboard/projects/${projectId}`} className="ml-4 text-green-600 hover:underline">
          ← Back to Project
        </Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Task not found</p>
          <Link
            href={`/admin/dashboard/projects/${projectId}`}
            className="mt-4 inline-block text-green-600 hover:underline"
          >
            ← Back to Project
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = checklist.filter((c) => c.completed).length;
  const totalCount = checklist.length;
  const projectName = project?.projectName ?? "Project";

  return (
    <div className="bg-gray-100 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
      {/* Fixed: Navbar (breadcrumbs + header) */}
      <div className="shrink-0 bg-gray-100 pt-6 pb-4">
        <div className="max-w-[1200px] mx-auto px-8 w-full">
          {/* Breadcrumbs */}
          <div className="mb-4 text-sm">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <span className="text-gray-400 mx-2">/</span>
            <Link href="/admin/dashboard/projects" className="text-gray-600 hover:text-gray-900">
              Projects
            </Link>
            <span className="text-gray-400 mx-2">/</span>
            <Link
              href={`/admin/dashboard/projects/${projectId}`}
              className="text-gray-600 hover:text-gray-900"
            >
              {projectName}
            </Link>
            <span className="text-gray-400 mx-2">/</span>
            <span className="text-green-600">{task.description}</span>
          </div>

          {/* Task Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/dashboard/projects/${projectId}`}
                  className="text-sm text-green-600 hover:text-green-700 mb-2 inline-block"
                >
                  ← {projectName}
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{task.description}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                  <span>Feb 15, 2026 • 09:00 AM</span>
                  <span>–</span>
                  <span>Feb 21, 2026 • 06:00 PM</span>
                  <span className="hidden sm:inline text-gray-300">|</span>
                  <span>Assigned To: {task.assignee.name}</span>
                  <span className="hidden sm:inline text-gray-300">|</span>
                  <span>Assigned By: Arjun Sindhia</span>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium w-fit ${getStatusStyles(task.status)}`}>
                  {task.status}
                </span>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.fig,.sketch"
                  />
                  <button
                    type="button"
                    onClick={handleAddFilesClick}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 whitespace-nowrap flex-1 sm:flex-initial min-w-0"
                  >
                    Add Files
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 whitespace-nowrap flex-1 sm:flex-initial min-w-0"
                  >
                    Activity Log
                  </button>
                  <select
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 bg-white min-w-0 flex-1 sm:flex-initial"
                    defaultValue={task.status}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                    <option value="On-Hold">On-Hold</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed: Checklist | Scrollable: Task Timeline */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-6 max-w-[1200px] mx-auto px-8 w-full pb-6 overflow-hidden">
        {/* Left - Checklist (fixed, no scroll) */}
        <div className="flex shrink-0 w-full lg:w-[380px] flex-col">
          <div className="scrollbar-hide bg-white rounded-2xl border border-gray-200 p-6 overflow-y-auto flex-1 min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Checklist</h2>
              <button
                type="button"
                onClick={startAddingSubtask}
                className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
                aria-label="Add subtask"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {isAddingSubtask && (
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={newSubtaskLabel}
                  onChange={(e) => setNewSubtaskLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addChecklistItem();
                    if (e.key === "Escape") cancelAddingSubtask();
                  }}
                  placeholder="Enter subtask..."
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={cancelAddingSubtask}
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="space-y-2">
              {checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className={item.completed ? "text-gray-500 line-through" : "text-gray-900"}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 shrink-0">
                {completedCount} of {totalCount} completed
              </span>
            </div>
          </div>
        </div>

        {/* Right - Task Timeline (scrollable, green scrollbar) */}
        <div className="scrollbar-green flex-1 min-w-0 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Timeline</h2>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Task Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{DEFAULT_DESCRIPTION}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Deliverables:</h3>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                {DEFAULT_DELIVERABLES.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="mb-6 border-2 border-dashed border-gray-200 rounded-lg p-6">
              {isAddingTimestamp ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newTimestampNote}
                    onChange={(e) => setNewTimestampNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addTimestamp();
                      if (e.key === "Escape") cancelAddingTimestamp();
                    }}
                    placeholder="Add a note (optional)"
                    autoFocus
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={cancelAddingTimestamp}
                      className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addTimestamp}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                    >
                      Add Timestamp
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingTimestamp(true)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  + Add Timestamp
                </button>
              )}
              {timestamps.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  {timestamps.map((ts) => (
                    <div
                      key={ts.id}
                      className="flex items-start gap-3 text-left text-sm bg-gray-50 rounded-lg p-3"
                    >
                      <span className="text-green-600 font-medium shrink-0">{ts.dateTime}</span>
                      {ts.note && <span className="text-gray-600">{ts.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created On</p>
                <p className="text-sm text-gray-900 mt-1">Feb 10, 2026 at 11:30 AM</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created By</p>
                <p className="text-sm text-gray-900 mt-1">Arjun Sindhia</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Started On</p>
                <p className="text-sm text-gray-900 mt-1">Feb 15, 2026 at 09:15 AM</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time Spent</p>
                <p className="text-sm text-gray-900 mt-1">12 hours 45 minutes</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</p>
                <p className="text-sm text-gray-400 mt-1">—</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Updated By</p>
                <p className="text-sm text-gray-400 mt-1">—</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
