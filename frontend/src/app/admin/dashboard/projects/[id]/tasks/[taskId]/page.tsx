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
  useGetTaskFilesQuery,
  useUploadTaskFileMutation,
  useDeleteTaskFileMutation,
  useGetTaskActivityQuery,
  mapFrontendToBackendStatus,
  type TaskApi,
  type ChecklistItemApi,
  type TaskFileApi,
} from "@/store/api/taskApiSlice";
import { transformBackendTaskToFrontend } from "../../_utils/taskTransformers";
import type { Task, TaskStatus } from "../../_components/taskTypes";
import ActivityLogModal from "../../_components/ActivityLogModal";
import AddTimestampModal, { type AddTimestampData } from "../../_components/AddTimestampModal";

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

function formatTimestamp(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  try {
    const d = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const t = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${d} at ${t}`;
  } catch {
    return typeof date === "string" ? date : dateObj.toString();
  }
}

const DEFAULT_DESCRIPTION =
  "Create pixel-perfect homepage UI design for all breakpoints (desktop, tablet, mobile). Ensure design follows the approved moodboard and style guide. Include all interactive states for buttons, forms, and navigation elements. Design should be responsive and optimized for handoff to frontend developers using Figma's developer mode.";

const TASK_STORAGE_KEY = "crm_selected_task";

function getStatusStyles(status: TaskStatus): string {
  switch (status) {
    case "Closed":      return "bg-green-100 text-green-700";
    case "In Progress": return "bg-amber-100 text-amber-700";
    case "On-Hold":     return "bg-orange-100 text-orange-700";
    default:            return "bg-gray-100 text-gray-700";
  }
}

function formatDateTime(dateStr: string, timeStr?: string): string {
  if (!dateStr) return "—";
  try {
    let datePart = dateStr;
    let extractedTime: string | undefined = timeStr;
    if (dateStr.includes("T")) {
      const [dateOnly, timePart] = dateStr.split("T");
      datePart = dateOnly;
      if (!extractedTime && timePart) extractedTime = timePart.split(".")[0];
    }
    const [year, month, day] = datePart.split("-").map(Number);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const formattedDate = `${months[month - 1]} ${day}, ${year}`;
    if (extractedTime) {
      const [hours, minutes] = extractedTime.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${formattedDate} – ${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
    }
    return formattedDate;
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
  } catch {}
  return null;
}

// ── Task Info Popover ─────────────────────────────────────────────────────────

function TaskInfoPopover({
  task,
  backendTask,
  activityData,
}: {
  task: Task;
  backendTask: TaskApi | null;
  activityData: any[] | undefined;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updatedBy = (() => {
    if (activityData && activityData.length > 0) {
      const sorted = [...activityData].sort(
        (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
      );
      return sorted[0].changedBy?.name || "—";
    }
    return "—";
  })();

  const rows = [
    {
      label: "Assigned To",
      value: task.assignee.name,
    },
    {
      label: "Assigned By",
      value: backendTask
        ? (backendTask as any).assignedBy?.name || backendTask.assignedBy_name || backendTask.assignedby_name || "—"
        : "—",
    },
    {
      label: "Start Date & Time",
      value: backendTask
        ? formatDateTime(
            (backendTask as any).startDate || backendTask.task_startDate || backendTask.task_startdate || "",
            (backendTask as any).startTime || backendTask.task_startTime || backendTask.task_starttime
          )
        : "—",
    },
    {
      label: "End Date & Time",
      value: backendTask
        ? formatDateTime(
            (backendTask as any).endDate || backendTask.task_endDate || backendTask.task_enddate || "",
            (backendTask as any).endTime || backendTask.task_endTime || backendTask.task_endtime
          )
        : "—",
    },
    {
      label: "Created On",
      value: backendTask
        ? formatDateTime(
            (backendTask as any).createdAt || backendTask.task_createdAt || backendTask.task_createdat || "",
            undefined
          )
        : "—",
    },
    {
      label: "Created By",
      value: backendTask
        ? (backendTask as any).assignedBy?.name || backendTask.assignedBy_name || backendTask.assignedby_name || "—"
        : "—",
    },
    {
      label: "Last Updated",
      value: backendTask
        ? formatDateTime(
            (backendTask as any).updatedAt || backendTask.task_updatedAt || backendTask.task_updatedat || "",
            undefined
          )
        : "—",
    },
    {
      label: "Updated By",
      value: updatedBy,
    },
    {
      label: "Status",
      value: task.status,
      isStatus: true,
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-semibold transition-colors select-none
          ${open
            ? "bg-green-600 border-green-600 text-white"
            : "border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600 bg-white"
          }`}
        aria-label="Task info"
      >
        i
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl w-72 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Task Info</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Info rows */}
          <div className="px-4 py-3 space-y-3">
            {rows.map(({ label, value, isStatus }) => (
              <div key={label} className="flex items-start justify-between gap-3">
                <span className="text-xs text-gray-500 shrink-0 pt-0.5">{label}</span>
                {isStatus ? (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${getStatusStyles(value as TaskStatus)}`}>
                    {value}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-gray-800 text-right">{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TaskDetailPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const taskId    = Array.isArray(params?.taskId) ? params.taskId[0] : params?.taskId;

  const { data: project, isLoading: isLoadingProject } = useGetProjectQuery(projectId ?? "", { skip: !projectId });

  const {
    data: backendTaskData,
    isLoading: isLoadingTask,
    isError: isTaskError,
    error: taskError,
  } = useGetTaskQuery(taskId ?? "", { skip: !taskId, refetchOnMountOrArgChange: true });

  const [updateTaskStatus, { isLoading: isUpdatingStatus }] = useUpdateTaskStatusMutation();

  const { data: checklistData, isLoading: isLoadingChecklist, refetch: refetchChecklist } =
    useGetChecklistQuery(taskId ?? "", { skip: !taskId, refetchOnMountOrArgChange: true });

  const [createChecklistItem] = useCreateChecklistItemMutation();
  const [updateChecklistItem] = useUpdateChecklistItemMutation();
  const [deleteChecklistItem] = useDeleteChecklistItemMutation();

  const { data: taskFilesData, isLoading: isLoadingFiles, refetch: refetchFiles } =
    useGetTaskFilesQuery(taskId ?? "", { skip: !taskId, refetchOnMountOrArgChange: true });

  const [uploadTaskFile, { isLoading: isUploadingFile }] = useUploadTaskFileMutation();
  const [deleteTaskFile, { isLoading: isDeletingFile }]  = useDeleteTaskFileMutation();

  const { data: activityData } = useGetTaskActivityQuery(taskId ?? "", {
    skip: !taskId,
    refetchOnMountOrArgChange: true,
  });

  const [task, setTask]           = useState<Task | null>(null);
  const [backendTask, setBackendTask] = useState<TaskApi | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskLabel, setNewSubtaskLabel] = useState("");
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [isAddTimestampModalOpen, setIsAddTimestampModalOpen] = useState(false);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [taskFiles, setTaskFiles] = useState<TaskFileApi[]>([]);

  useEffect(() => {
    if (backendTaskData) {
      setBackendTask(backendTaskData);
      setTask(transformBackendTaskToFrontend(backendTaskData));
    } else if (taskId) {
      const fromStorage = getTaskFromStorage(taskId);
      if (fromStorage) { setTask(fromStorage); sessionStorage.removeItem(TASK_STORAGE_KEY); }
    }
  }, [backendTaskData, taskId]);

  useEffect(() => {
    if (checklistData && checklistData.length > 0) {
      setChecklist(checklistData.map((item: ChecklistItemApi) => ({
        id: item.id, label: item.itemName, completed: item.isCompleted,
      })));
    } else {
      setChecklist([]);
    }
  }, [checklistData]);

  useEffect(() => {
    setTaskFiles(taskFilesData && taskFilesData.length > 0 ? taskFilesData : []);
  }, [taskFilesData]);

  const toggleChecklistItem = useCallback(async (id: string) => {
    if (!taskId) return;
    const item = checklist.find((i) => i.id === id);
    if (!item) return;
    setChecklist((prev) => prev.map((i) => i.id === id ? { ...i, completed: !i.completed } : i));
    try {
      await updateChecklistItem({ taskId, itemId: id, body: { isCompleted: !item.completed } }).unwrap();
      await refetchChecklist();
    } catch (error: any) {
      setChecklist((prev) => prev.map((i) => i.id === id ? { ...i, completed: item.completed } : i));
      toast.error(error?.data?.message || "Failed to update checklist item");
    }
  }, [taskId, checklist, updateChecklistItem, refetchChecklist]);

  const startAddingSubtask  = useCallback(() => { setIsAddingSubtask(true); setNewSubtaskLabel(""); }, []);
  const cancelAddingSubtask = useCallback(() => { setIsAddingSubtask(false); setNewSubtaskLabel(""); }, []);

  const addChecklistItem = useCallback(async () => {
    if (!taskId) return;
    const label = newSubtaskLabel.trim();
    if (!label) { toast.error("Please enter a checklist item name"); return; }
    try {
      await createChecklistItem({ taskId, body: { itemName: label } }).unwrap();
      setNewSubtaskLabel(""); setIsAddingSubtask(false);
      toast.success("Checklist item added");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add checklist item");
    }
  }, [taskId, newSubtaskLabel, createChecklistItem]);

  const addTimestampFromModal = useCallback((data: AddTimestampData) => {
    const [y, m, d] = data.date.split("-").map(Number);
    const date = new Date(y, (m ?? 1) - 1, d ?? 1);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setTimestamps((prev) => [...prev, { id: `ts-${Date.now()}`, dateTime: dateStr, hours: data.hours, minutes: data.minutes, note: data.notes }]);
  }, []);

  const handleAddFilesClick = useCallback(() => { fileInputRef.current?.click(); }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !taskId) return;
    const fileArray = Array.from(files);
    try {
      for (const file of fileArray) await uploadTaskFile({ taskId, file }).unwrap();
      toast.success(fileArray.length === 1 ? "File uploaded successfully" : `${fileArray.length} files uploaded successfully`);
      await refetchFiles();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to upload file(s)");
    } finally { e.target.value = ""; }
  }, [taskId, uploadTaskFile, refetchFiles]);

  const handleDeleteFile = useCallback(async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    try {
      await deleteTaskFile(fileId).unwrap();
      toast.success("File deleted successfully");
      await refetchFiles();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete file");
    }
  }, [deleteTaskFile, refetchFiles]);

  const handleStatusChange = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!taskId || !task) return;
    const newStatus = e.target.value as TaskStatus;
    setTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    try {
      await updateTaskStatus({ id: taskId, body: { newStatus: mapFrontendToBackendStatus(newStatus) } }).unwrap();
      toast.success("Task status updated successfully");
    } catch (error: any) {
      setTask((prev) => (prev ? { ...prev, status: task.status } : null));
      toast.error(error?.data?.message || "Failed to update task status");
    }
  }, [taskId, task, updateTaskStatus]);

  if (!taskId || !projectId) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <p className="text-gray-600">Invalid URL</p>
        <Link href={`/admin/dashboard/projects/${projectId}`} className="ml-4 text-green-600 hover:underline">← Back to Project</Link>
      </div>
    );
  }
  if (isLoadingTask || isLoadingProject || isLoadingChecklist) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <p className="text-gray-600">Loading task details…</p>
      </div>
    );
  }
  if (isTaskError || !task) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{(taskError as { data?: { message?: string } })?.data?.message || "Task not found"}</p>
          <Link href={`/admin/dashboard/projects/${projectId}`} className="mt-4 inline-block text-green-600 hover:underline">← Back to Project</Link>
        </div>
      </div>
    );
  }

  const completedCount = checklist.filter((c) => c.completed).length;
  const totalCount     = checklist.length;
  const projectName    = project?.name ?? "Project";

  return (
    <div className="bg-gray-100 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>

      {/* Fixed: Navbar */}
      <div className="shrink-0 bg-gray-100 pt-6 pb-4">
        <div className="px-8 w-full overflow-x-auto scrollbar-hide">
          <div className="min-w-[900px] max-w-[1600px] mx-auto">
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

              {/* Data row */}
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
                    {backendTask ? formatDateTime((backendTask as any).startDate || backendTask.task_startDate || backendTask.task_startdate || "", (backendTask as any).startTime || backendTask.task_startTime || backendTask.task_starttime) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">End Date & Time</p>
                  <p className="text-gray-900 mt-0.5">
                    {backendTask ? formatDateTime((backendTask as any).endDate || backendTask.task_endDate || backendTask.task_enddate || "", (backendTask as any).endTime || backendTask.task_endTime || backendTask.task_endtime) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned To</p>
                  <p className="text-gray-900 mt-0.5">{task.assignee.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned By</p>
                  <p className="text-gray-900 mt-0.5">
                    {backendTask ? (backendTask as any).assignedBy?.name || backendTask.assignedBy_name || backendTask.assignedby_name || "—" : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                  <p className="mt-0.5">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getStatusStyles(task.status)}`}>{task.status}</span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap justify-end gap-2 pt-1.5 border-t border-gray-100">
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.fig,.sketch" disabled={isUploadingFile} />
                <button type="button" onClick={handleAddFilesClick} disabled={isUploadingFile} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                  {isUploadingFile ? "Uploading..." : "Add Files"}
                </button>
                <button type="button" onClick={() => setIsActivityLogOpen(true)} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 whitespace-nowrap">
                  Activity Log
                </button>
                <select className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 bg-white hover:bg-gray-50" value={task.status} onChange={handleStatusChange} disabled={isUpdatingStatus}>
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

      {/* Body: Checklist | Timeline */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-6 max-w-[1600px] mx-auto px-8 w-full pb-6 overflow-hidden">

        {/* ── Left: Checklist ── */}
        <div className="flex shrink-0 w-full lg:w-[480px] flex-col">
          <div className="scrollbar-hide bg-white rounded-2xl border border-gray-200 p-6 overflow-y-auto flex-1 min-h-0 flex flex-col">

            {/* Checklist header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Checklist</h2>
              <button type="button" onClick={startAddingSubtask} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50" aria-label="Add subtask">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* New item input */}
            {isAddingSubtask && (
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={newSubtaskLabel}
                  onChange={(e) => setNewSubtaskLabel(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addChecklistItem(); if (e.key === "Escape") cancelAddingSubtask(); }}
                  placeholder="Enter subtask..."
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                />
                <button type="button" onClick={addChecklistItem} className="px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700">Add</button>
                <button type="button" onClick={cancelAddingSubtask} className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50">Cancel</button>
              </div>
            )}

            {/* Checklist items */}
            <div className="space-y-2 flex-1">
              {checklist.map((item) => (
                <label key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={item.completed} onChange={() => toggleChecklistItem(item.id)} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                  <span className={item.completed ? "text-gray-500 line-through" : "text-gray-900"}>{item.label}</span>
                </label>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }} />
              </div>
              <span className="text-sm text-gray-500 shrink-0">{completedCount} of {totalCount} completed</span>
            </div>

            {/* ── Project button — links back to project page ── */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href={`/admin/dashboard/projects/${projectId}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-green-500 hover:text-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {projectName}
              </Link>
            </div>

          </div>
        </div>

        {/* ── Right: Task Timeline ── */}
        <div className="scrollbar-hide flex-1 min-w-0 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">

            {/* Timeline header with ⓘ button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Task Timeline</h2>
              <TaskInfoPopover task={task} backendTask={backendTask} activityData={activityData} />
            </div>

            {/* Task Files */}
            {taskFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Files</h3>
                <div className="space-y-2">
                  {taskFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:text-green-700 hover:underline truncate block">{file.name}</a>
                          <p className="text-xs text-gray-500">{file.uploadedBy?.name || "Unknown"} • {formatTimestamp(file.uploadedAt)}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleDeleteFile(file.id, file.name)} disabled={isDeletingFile} className="ml-2 p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" aria-label={`Delete ${file.name}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Task Description */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Task Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {(() => {
                  const taskDesc =
                    (backendTask as any)?.description ||
                    backendTask?.task_taskDescription ||
                    backendTask?.task_taskdescription ||
                    "";
                  if (!taskDesc) return DEFAULT_DESCRIPTION;
                  try {
                    const metadata = JSON.parse(taskDesc);
                    if (metadata.originalDescription) return metadata.originalDescription;
                    if (metadata.description) return metadata.description;
                  } catch {}
                  return taskDesc || DEFAULT_DESCRIPTION;
                })()}
              </p>
            </div>

            {/* Add Timestamp */}
            <div className="mb-6 border-2 border-dashed border-gray-200 rounded-lg p-6">
              <button type="button" onClick={() => setIsAddTimestampModalOpen(true)} className="w-full text-sm text-gray-500 hover:text-gray-700">
                + Add Timestamp
              </button>
              {timestamps.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  {timestamps.map((ts) => (
                    <div key={ts.id} className="flex items-start gap-3 text-left text-sm bg-gray-50 rounded-lg p-3">
                      <span className="text-green-600 font-medium shrink-0">
                        {ts.dateTime}
                        {(ts.hours != null && ts.hours > 0) || (ts.minutes != null && ts.minutes > 0) ? ` • ${ts.hours ?? 0}h ${ts.minutes ?? 0}m` : ""}
                      </span>
                      {ts.note && <span className="text-gray-600">{ts.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>



          </div>
        </div>
      </div>

      <ActivityLogModal isOpen={isActivityLogOpen} onClose={() => setIsActivityLogOpen(false)} taskId={taskId ?? ""} />
      <AddTimestampModal isOpen={isAddTimestampModalOpen} onClose={() => setIsAddTimestampModalOpen(false)} onAdd={addTimestampFromModal} />
    </div>
  );
}