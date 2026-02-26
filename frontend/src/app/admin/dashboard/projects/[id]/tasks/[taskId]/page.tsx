"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useState, useCallback, useEffect, useRef } from "react";
import { useGetProjectQuery } from "@/store/api/projectApiSlice";
import {
  useGetTaskQuery,
  useUpdateTaskStatusMutation,
  useGetChecklistQuery,
  useCreateChecklistItemMutation,
  useUpdateChecklistItemMutation,
  useDeleteChecklistItemMutation,
  mapFrontendToBackendStatus,
  type TaskApi,
  type ChecklistItemApi,
} from "@/store/api/taskApiSlice";
import { transformBackendTaskToFrontend } from "../../_utils/taskTransformers";
import type { Task, TaskStatus } from "../../_components/taskTypes";
import ActivityLogModal from "../../_components/ActivityLogModal";
import AddTimestampModal, { type AddTimestampData } from "../../_components/AddTimestampModal";

// Frontend checklist item type (matches backend ChecklistItemApi)
type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

type Timestamp = {
  id: string;
  dateTime: string;
  hours?: number;
  minutes?: number;
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
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatDateTime(dateStr: string, timeStr?: string): string {
  if (!dateStr) return "—";
  try {
    // Handle ISO timestamp format (e.g., "2026-02-18T18:30:00.000Z")
    let datePart = dateStr;
    let extractedTime: string | undefined = timeStr;
    
    if (dateStr.includes("T")) {
      const [dateOnly, timePart] = dateStr.split("T");
      datePart = dateOnly;
      if (!extractedTime && timePart) {
        extractedTime = timePart.split(".")[0]; // Remove milliseconds
      }
    }
    
    const [year, month, day] = datePart.split("-").map(Number);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${months[month - 1]} ${day}, ${year}`;
    
    if (extractedTime) {
      const [hours, minutes] = extractedTime.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${formattedDate} – ${displayHours}:${displayMinutes} ${period}`;
    }
    
    return formattedDate;
  } catch {
    return dateStr;
  }
}

function formatDateOnly(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[month - 1]} ${day}, ${year}`;
  } catch {
    return dateStr;
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

  const { data: project, isLoading: isLoadingProject } = useGetProjectQuery(projectId ?? "", { skip: !projectId });
  
  // Fetch task from backend API
  const {
    data: backendTaskData,
    isLoading: isLoadingTask,
    isError: isTaskError,
    error: taskError,
  } = useGetTaskQuery(taskId ?? "", { skip: !taskId });

  // Task status mutation
  const [updateTaskStatus, { isLoading: isUpdatingStatus }] = useUpdateTaskStatusMutation();

  // Checklist API hooks
  const {
    data: checklistData,
    isLoading: isLoadingChecklist,
    refetch: refetchChecklist,
  } = useGetChecklistQuery(taskId ?? "", { skip: !taskId });
  
  const [createChecklistItem, { isLoading: isCreatingChecklistItem }] = useCreateChecklistItemMutation();
  const [updateChecklistItem, { isLoading: isUpdatingChecklistItem }] = useUpdateChecklistItemMutation();
  const [deleteChecklistItem, { isLoading: isDeletingChecklistItem }] = useDeleteChecklistItemMutation();

  const [task, setTask] = useState<Task | null>(null);
  const [backendTask, setBackendTask] = useState<TaskApi | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskLabel, setNewSubtaskLabel] = useState("");
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [isAddTimestampModalOpen, setIsAddTimestampModalOpen] = useState(false);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transform backend task data to frontend format
  useEffect(() => {
    if (backendTaskData) {
      setBackendTask(backendTaskData);
      const transformedTask = transformBackendTaskToFrontend(backendTaskData);
      setTask(transformedTask);
    } else if (taskId) {
      // Fallback to sessionStorage if API data not available yet
      const fromStorage = getTaskFromStorage(taskId);
      if (fromStorage) {
        setTask(fromStorage);
        sessionStorage.removeItem(TASK_STORAGE_KEY);
      }
    }
  }, [backendTaskData, taskId]);

  // Transform backend checklist data to frontend format
  useEffect(() => {
    if (checklistData && checklistData.length > 0) {
      const transformed = checklistData.map((item: ChecklistItemApi) => ({
        id: item.id,
        label: item.itemName,
        completed: item.isCompleted,
      }));
      setChecklist(transformed);
    } else {
      // Empty checklist from backend or no data
      setChecklist([]);
    }
  }, [checklistData]);

  const toggleChecklistItem = useCallback(
    async (id: string) => {
      if (!taskId) return;
      
      const item = checklist.find((i) => i.id === id);
      if (!item) return;

      // Optimistically update UI
      setChecklist((prev) =>
        prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
      );

      try {
        await updateChecklistItem({
          taskId,
          itemId: id,
          body: { isCompleted: !item.completed },
        }).unwrap();
      } catch (error: any) {
        // Revert on error
        setChecklist((prev) =>
          prev.map((i) => (i.id === id ? { ...i, completed: item.completed } : i))
        );
        toast.error(error?.data?.message || "Failed to update checklist item");
      }
    },
    [taskId, checklist, updateChecklistItem]
  );

  const startAddingSubtask = useCallback(() => {
    setIsAddingSubtask(true);
    setNewSubtaskLabel("");
  }, []);

  const addChecklistItem = useCallback(async () => {
    if (!taskId) return;
    
    const label = newSubtaskLabel.trim();
    if (!label) {
      toast.error("Please enter a checklist item name");
      return;
    }

    try {
      await createChecklistItem({
        taskId,
        body: { itemName: label },
      }).unwrap();
      
      setNewSubtaskLabel("");
      setIsAddingSubtask(false);
      toast.success("Checklist item added");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add checklist item");
    }
  }, [taskId, newSubtaskLabel, createChecklistItem]);

  const cancelAddingSubtask = useCallback(() => {
    setIsAddingSubtask(false);
    setNewSubtaskLabel("");
  }, []);

  const addTimestampFromModal = useCallback((data: AddTimestampData) => {
    const [y, m, d] = data.date.split("-").map(Number);
    const date = new Date(y, (m ?? 1) - 1, d ?? 1);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setTimestamps((prev) => [
      ...prev,
      {
        id: `ts-${Date.now()}`,
        dateTime: dateStr,
        hours: data.hours,
        minutes: data.minutes,
        note: data.notes,
      },
    ]);
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

  const handleStatusChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!taskId || !task) return;
      
      const newStatus = e.target.value as TaskStatus;
      
      // Optimistically update UI
      setTask((prev) => (prev ? { ...prev, status: newStatus } : null));
      
      try {
        // Update status via API
        const backendStatus = mapFrontendToBackendStatus(newStatus);
        await updateTaskStatus({
          id: taskId,
          body: { newStatus: backendStatus },
        }).unwrap();
        
        toast.success("Task status updated successfully");
      } catch (error: any) {
        // Revert on error
        setTask((prev) => (prev ? { ...prev, status: task.status } : null));
        toast.error(error?.data?.message || "Failed to update task status");
      }
    },
    [taskId, task, updateTaskStatus]
  );

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

  if (isLoadingTask || isLoadingProject || isLoadingChecklist) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading task details…</p>
        </div>
      </div>
    );
  }

  if (isTaskError || !task) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">
            {(taskError as { data?: { message?: string } })?.data?.message || "Task not found"}
          </p>
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
  const projectName = project?.name ?? "Project";

  return (
    <div className="bg-gray-100 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
      {/* Fixed: Navbar (breadcrumbs + header) */}
      <div className="shrink-0 bg-gray-100 pt-6 pb-4">
        <div className="mx-auto px-8 w-full overflow-x-auto scrollbar-hide">
          <div className="min-w-[900px] max-w-[1600px]">
            {/* Task Header - column layout with horizontal scroll */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <Link
                  href={`/admin/dashboard/projects/${projectId}`}
                  className="text-sm text-green-600 hover:text-green-700 shrink-0 inline-flex items-center gap-1"
                >
                  <span>←</span>
                  <span>{projectName}</span>
                </Link>
                
              </div>
              <h1 className="text-lg font-bold text-gray-900 mb-2">{task.description}</h1>

              {/* Data row with labels */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-1.5 mb-2 text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Project</p>
                  <p className="text-green-600 font-medium mt-0.5">{projectName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Task</p>
                  <p className="text-gray-900 mt-0.5">{task.description}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date & Time</p>
                  <p className="text-gray-900 mt-0.5">
                    {backendTask
                      ? formatDateTime(
                          backendTask.task_startDate || backendTask.task_startdate || "",
                          backendTask.task_startTime || backendTask.task_starttime
                        )
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">End Date & Time</p>
                  <p className="text-gray-900 mt-0.5">
                    {backendTask
                      ? formatDateTime(
                          backendTask.task_endDate || backendTask.task_enddate || "",
                          backendTask.task_endTime || backendTask.task_endtime
                        )
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned To</p>
                  <p className="text-gray-900 mt-0.5">{task.assignee.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned By</p>
                  <p className="text-gray-900 mt-0.5">
                    {backendTask
                      ? backendTask.assignedBy_name || backendTask.assignedby_name || "—"
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                  <p className="mt-0.5">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getStatusStyles(task.status)}`}>
                      {task.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action buttons - right aligned */}
              <div className="flex flex-wrap justify-end gap-2 pt-1.5 border-t border-gray-100">
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
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 whitespace-nowrap"
                >
                  Add Files
                </button>
                <button
                  type="button"
                  onClick={() => setIsActivityLogOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 whitespace-nowrap"
                >
                  Activity Log
                </button>
                <select
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 bg-white hover:bg-gray-50"
                  value={task.status}
                  onChange={handleStatusChange}
                  disabled={isUpdatingStatus}
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

      {/* Fixed: Checklist | Scrollable: Task Timeline */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-6 max-w-[1600px] mx-auto px-8 w-full pb-6 overflow-hidden">
        {/* Left - Checklist */}
        <div className="flex shrink-0 w-full lg:w-[480px] flex-col">
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
        <div className="scrollbar-hide flex-1 min-w-0 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Timeline</h2>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Task Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {(() => {
                  const taskDesc =
                    backendTask?.task_taskDescription || backendTask?.task_taskdescription || "";
                  if (!taskDesc) return DEFAULT_DESCRIPTION;
                  
                  // Try to parse JSON metadata
                  try {
                    const metadata = JSON.parse(taskDesc);
                    if (metadata.originalDescription) {
                      return metadata.originalDescription;
                    }
                  } catch {
                    // If not JSON, use as-is
                  }
                  
                  return taskDesc || DEFAULT_DESCRIPTION;
                })()}
              </p>
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
                <button
                  type="button"
                  onClick={() => setIsAddTimestampModalOpen(true)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  + Add Timestamp
                </button>
              {timestamps.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  {timestamps.map((ts) => (
                    <div
                      key={ts.id}
                      className="flex items-start gap-3 text-left text-sm bg-gray-50 rounded-lg p-3"
                    >
                      <span className="text-green-600 font-medium shrink-0">
                        {ts.dateTime}
                        {(ts.hours != null && ts.hours > 0) || (ts.minutes != null && ts.minutes > 0)
                          ? ` • ${ts.hours ?? 0}h ${ts.minutes ?? 0}m`
                          : ""}
                      </span>
                      {ts.note && <span className="text-gray-600">{ts.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created On</p>
                <p className="text-sm text-gray-900 mt-1">
                  {backendTask
                    ? formatDateTime(
                        backendTask.task_createdAt || backendTask.task_createdat || "",
                        undefined
                      )
                    : "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created By</p>
                <p className="text-sm text-gray-900 mt-1">
                  {backendTask
                    ? backendTask.assignedBy_name || backendTask.assignedby_name || "—"
                    : "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Started On</p>
                <p className="text-sm text-gray-900 mt-1">
                  {backendTask
                    ? formatDateTime(
                        backendTask.task_startDate || backendTask.task_startdate || "",
                        backendTask.task_startTime || backendTask.task_starttime
                      )
                    : "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time Spent</p>
                <p className="text-sm text-gray-900 mt-1">—</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</p>
                <p className="text-sm text-gray-900 mt-1">
                  {backendTask
                    ? formatDateTime(
                        backendTask.task_updatedAt || backendTask.task_updatedat || "",
                        undefined
                      )
                    : "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Updated By</p>
                <p className="text-sm text-gray-900 mt-1">—</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ActivityLogModal isOpen={isActivityLogOpen} onClose={() => setIsActivityLogOpen(false)} />
      <AddTimestampModal
        isOpen={isAddTimestampModalOpen}
        onClose={() => setIsAddTimestampModalOpen(false)}
        onAdd={addTimestampFromModal}
      />
    </div>
  );
}
