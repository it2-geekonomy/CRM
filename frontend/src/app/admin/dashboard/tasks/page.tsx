"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import moment from "moment";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import type { SlotInfo } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { 
  useGetCalendarTasksQuery, 
  useCreateTaskMutation,
  type CalendarTaskApi, 
  mapBackendToFrontendStatus,
  type CreateTaskBody 
} from "@/store/api/taskApiSlice";
import { useGetProjectsQuery } from "@/store/api/projectApiSlice";
import { useGetEmployeesQuery } from "@/store/api/employeeApiSlice";
import { useGetTaskTypesQuery } from "@/store/api/taskTypeApiSlice";
import { toast } from "react-toastify";

const localizer = momentLocalizer(moment);

// Static arrays - moved outside component to prevent recreation on every render
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Helper function to check if two dates are the same day (optimized)
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Helper function to check if a date falls within a task's date range (inclusive)
const isDateInRange = (selectedDate: Date, taskStart: Date, taskEnd: Date): boolean => {
  // Normalize dates to start of day for comparison (ignore time)
  const selected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const start = new Date(taskStart.getFullYear(), taskStart.getMonth(), taskStart.getDate());
  const end = new Date(taskEnd.getFullYear(), taskEnd.getMonth(), taskEnd.getDate());
  
  // Check if selected date is between start and end (inclusive)
  return selected >= start && selected <= end;
};

// Calendar event format
type CalendarTask = {
  id: string;
  title: string;
  assignedTo: string;
  department: string;
  start: Date;
  end: Date;
  status: "Pending" | "Completed" | "In Progress" | "Closed" | "On-Hold" | "Open";
  priority?: string;
  project?: string;
  taskType?: string;
  resource?: any; // Store original task data
};

// Transform backend CalendarTaskApi (nested objects) to calendar event format
function transformTaskToCalendarEvent(task: CalendarTaskApi): CalendarTask | null {
  try {
    // Get task name (title)
    const title = task.name || "Untitled Task";
    
    // Get assigned to name
    const assignedTo = task.assignedTo?.name || "Unassigned";
    
    // Get department name from taskType.department or use project name as fallback
    const department = task.taskType?.department?.name || task.project?.name || "General";
    
    // Parse dates - handle different date formats from backend
    // Backend returns dates as strings (YYYY-MM-DD format)
    if (!task.startDate) {
      console.warn("Task missing startDate:", task.id);
      return null;
    }
    
    // Parse start date - use strict parsing to avoid timezone issues
    // Parse as local date (not UTC) to match calendar display
    let startMoment = moment(task.startDate, "YYYY-MM-DD", true);
    if (!startMoment.isValid()) {
      // Fallback: try parsing without strict mode
      startMoment = moment(task.startDate);
      if (!startMoment.isValid()) {
        console.warn("Invalid startDate for task:", task.id, task.startDate);
        return null;
      }
    }
    
    // Parse end date
    let endMoment: moment.Moment;
    if (task.endDate) {
      endMoment = moment(task.endDate, "YYYY-MM-DD", true);
      if (!endMoment.isValid()) {
        endMoment = moment(task.endDate);
        if (!endMoment.isValid()) {
          console.warn("Invalid endDate for task:", task.id, task.endDate);
          return null;
        }
      }
    } else {
      // If no end date, use start date
      endMoment = startMoment.clone();
    }
    
    // Parse times - handle HH:mm format
    const startTime = task.startTime || "00:00";
    const endTime = task.endTime || (task.endDate === task.startDate ? startTime : "23:59");
    
    // Split time into hours and minutes (handle both "HH:mm" and "H:mm" formats)
    const startTimeParts = startTime.split(":").map(s => s.trim());
    const endTimeParts = endTime.split(":").map(s => s.trim());
    const startHours = parseInt(startTimeParts[0] || "0", 10);
    const startMinutes = parseInt(startTimeParts[1] || "0", 10);
    const endHours = parseInt(endTimeParts[0] || "23", 10);
    const endMinutes = parseInt(endTimeParts[1] || "59", 10);
    
    // Validate time values
    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
      console.warn("Invalid time format for task:", task.id, "startTime:", task.startTime, "endTime:", task.endTime);
      return null;
    }
    
    // Set time on the dates (in local timezone - no UTC conversion)
    // This ensures dates stay on the correct day regardless of timezone
    startMoment.hour(startHours).minute(startMinutes).second(0).millisecond(0);
    endMoment.hour(endHours).minute(endMinutes).second(59).millisecond(999);
    
    // Ensure end is after start
    if (endMoment.isBefore(startMoment)) {
      if (endMoment.isSame(startMoment, "day")) {
        // Same day but end time before start time - set end to end of day
        endMoment = startMoment.clone().endOf("day");
      } else {
        // End date before start date - use start date with end of day
        endMoment = startMoment.clone().endOf("day");
      }
    }
    
    // Convert to Date objects (these will be in local timezone)
    const startDate = startMoment.toDate();
    const endDate = endMoment.toDate();
    
    // Removed debug log to improve performance
    
    // Get status
    const backendStatus = task.status;
    const frontendStatus = backendStatus ? mapBackendToFrontendStatus(backendStatus) : "Open";
    
    // Map frontend status to calendar status format
    let calendarStatus: "Pending" | "Completed" | "In Progress" | "Closed" | "On-Hold" | "Open";
    if (frontendStatus === "Closed") calendarStatus = "Completed";
    else if (frontendStatus === "In Progress") calendarStatus = "In Progress";
    else if (frontendStatus === "On-Hold") calendarStatus = "Pending";
    else calendarStatus = "Pending";
    
    return {
      id: task.id,
      title,
      assignedTo,
      department,
      start: startDate,
      end: endDate,
      status: calendarStatus,
      priority: task.priority || "Medium",
      project: task.project?.name || "—",
      taskType: task.taskType?.name || "—",
      resource: task,
    };
  } catch (error) {
    console.error("Error transforming task:", error, task);
    return null;
  }
}
  

export default function TaskCalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState(Views.MONTH);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get current year and month for calendar query (for API) - memoized to prevent unnecessary re-renders
  const calendarQueryParams = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // getMonth() returns 0-11, backend expects 1-12
    return {
      year: String(year),
      month: String(month).padStart(2, '0'), // Backend expects "01", "02", etc.
    };
  }, [currentDate]);

  // Fetch tasks from calendar API using Redux Toolkit Query
  const { data: tasksData, isLoading, isError, error } = useGetCalendarTasksQuery(calendarQueryParams);

  // Debug logging (only on error to avoid performance issues)
  useEffect(() => {
    if (isError) {
      console.error("Calendar Tasks API Error:", error);
    }
  }, [isError, error]);

  // Fetch data for create task modal
  const { data: projectsData } = useGetProjectsQuery({ limit: 100, status: "Active" });
  const { data: employeesData } = useGetEmployeesQuery({ limit: 100 });
  const { data: taskTypesData } = useGetTaskTypesQuery();
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();

  const projects = projectsData?.data || [];
  const employees = employeesData?.data || [];
  const taskTypes = taskTypesData || [];

  // Transform tasks to calendar format (memoized for performance)
  const calendarTasks = useMemo(() => {
    if (!tasksData || tasksData.length === 0) return [];
    
    const transformed = tasksData
      .map(transformTaskToCalendarEvent)
      .filter((task): task is CalendarTask => task !== null);
    
    return transformed;
  }, [tasksData]);

  // Memoize filtered tasks for selected date (show tasks that fall within the date range)
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return calendarTasks.filter((task) => 
      isDateInRange(selectedDate, task.start, task.end)
    );
  }, [calendarTasks, selectedDate]);

  // Create a map of dates to task counts for efficient lookup
  const dateTaskCountMap = useMemo(() => {
    const map = new Map<string, number>();
    calendarTasks.forEach((task) => {
      // Get all dates in the task's range
      const start = new Date(task.start.getFullYear(), task.start.getMonth(), task.start.getDate());
      const end = new Date(task.end.getFullYear(), task.end.getMonth(), task.end.getDate());
      
      // Iterate through each date in the range
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
        map.set(dateKey, (map.get(dateKey) || 0) + 1);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return map;
  }, [calendarTasks]);

  // Add task counts and highlight selected date after calendar renders
  useEffect(() => {
    if (view !== Views.MONTH) return; // Only apply to month view
    
    // Small delay to ensure calendar is fully rendered
    const timer = setTimeout(() => {
      // Remove previous highlights and counts
      document.querySelectorAll('.rbc-day-bg').forEach((cell) => {
        const bg = cell as HTMLElement;
        // Reset background only if it's not today's date (preserve today highlight)
        const isToday = bg.classList.contains('rbc-today');
        if (!isToday) {
          bg.style.backgroundColor = '';
        }
        const existingCount = bg.querySelector('.task-count-indicator');
        if (existingCount) {
          existingCount.remove();
        }
      });

      // Get all rows in the calendar
      const rows = document.querySelectorAll('.rbc-month-row');
      
      if (rows.length === 0) return; // Calendar not ready yet
      
      rows.forEach((row) => {
        const dateCells = row.querySelectorAll('.rbc-date-cell');
        const dayBgs = row.querySelectorAll('.rbc-day-bg');
        
        // Match each day-bg with its corresponding date-cell
        dayBgs.forEach((bg, index) => {
          const bgElement = bg as HTMLElement;
          const dateCell = dateCells[index] as HTMLElement;
          
          if (!dateCell) return;
          
          // First check: Look for off-range classes that react-big-calendar uses
          // to mark dates from other months (these are typically grayed out)
          const isOffRange = dateCell.classList.contains('rbc-off-range') || 
                            bgElement.classList.contains('rbc-off-range-bg') ||
                            dateCell.closest('.rbc-off-range') !== null;
          
          if (isOffRange) {
            return; // Skip dates from other months
          }
          
          // Get the date number from the date cell
          const dateLink = dateCell.querySelector('a');
          const dayNumberText = dateLink?.textContent?.trim() || dateCell.textContent?.trim();
          
          if (!dayNumberText) return;
          
          const dayNumber = parseInt(dayNumberText);
          if (isNaN(dayNumber)) return;
          
          // Calculate the actual date
          const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
          
          // Check if this date is from previous/next month
          // If the calculated month doesn't match current month, it's from another month
          // This happens when dayNumber (e.g., 1-3) appears at the start but belongs to next month
          // or when dayNumber (e.g., 29-31) appears at the end but belongs to previous month
          if (cellDate.getMonth() !== currentDate.getMonth() || 
              cellDate.getFullYear() !== currentDate.getFullYear()) {
            return; // Skip dates from other months
          }
          
          // Additional check: Check if the date link has reduced opacity (typical for off-range dates)
          if (dateLink) {
            const computedStyle = window.getComputedStyle(dateLink);
            const opacity = parseFloat(computedStyle.opacity);
            // Off-range dates typically have opacity < 1 (usually 0.3 or similar)
            if (opacity < 0.5) {
              return; // Skip grayed out dates from other months
            }
          }
          
          const dateKey = `${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}`;
          const taskCount = dateTaskCountMap.get(dateKey) || 0;
          
          // Highlight selected date
          if (selectedDate && isSameDay(cellDate, selectedDate)) {
            bgElement.style.backgroundColor = 'rgba(105, 174, 68, 0.3)';
            bgElement.style.borderRadius = '4px';
          }
          
          // Add task count indicator (only for current month dates)
          if (taskCount > 0) {
            const countEl = document.createElement('span');
            countEl.className = 'task-count-indicator';
            countEl.textContent = `+${taskCount}`;
            countEl.style.cssText = `
              position: absolute;
              bottom: 2px;
              right: 2px;
              font-size: 10px;
              font-weight: 600;
              color: #69AE44;
              background-color: rgba(105, 174, 68, 0.1);
              padding: 2px 6px;
              border-radius: 4px;
              z-index: 10;
              pointer-events: none;
            `;
            bgElement.style.position = 'relative';
            bgElement.appendChild(countEl);
          }
        });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [calendarTasks, selectedDate, currentDate, dateTaskCountMap, view]);

  // Memoize years array to prevent recreation on every render
  const years = useMemo(() => {
    const yearRange = 10;
    return Array.from(
      { length: yearRange * 2 + 1 },
      (_, i) => new Date().getFullYear() - yearRange + i
    );
  }, []);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    // When clicking on a date slot, show tasks for that date
    setSelectedDate(slotInfo.start);
  }, []);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const goToMonthYear = (month: number, year: number) => {
    setCurrentDate(new Date(year, month, 1));
  };

  // Handle create task form submission
  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isCreatingTask) {
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    
    const projectId = formData.get("projectId") as string;
    const assignedToId = formData.get("assignedToId") as string;
    const taskTypeId = formData.get("taskTypeId") as string;
    const name = formData.get("taskName") as string;
    const description = formData.get("description") as string;
    const startDate = formData.get("startDate") as string;
    const startTime = formData.get("startTime") as string;
    const endDate = formData.get("endDate") as string;
    const endTime = formData.get("endTime") as string;
    const priority = formData.get("priority") as "Low" | "Medium" | "High" | undefined;

    if (!projectId || !assignedToId || !taskTypeId || !name || !startDate || !startTime || !endDate || !endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const taskData: CreateTaskBody = {
        name,
        description: description || undefined,
        startDate,
        startTime,
        endDate,
        endTime,
        assignedToId,
        projectId,
        taskTypeId,
        priority,
      };

      await createTask(taskData).unwrap();
      
      // Success - close modal and reset form
      toast.success("Task created successfully!");
      setIsModalOpen(false);
      e.currentTarget.reset();
    } catch (error: any) {
      // Only show error if it's a real HTTP error (4xx or 5xx)
      // This prevents showing errors for network issues that might occur after successful creation
      const errorStatus = error?.status;
      const isHttpError = errorStatus && (errorStatus >= 400 && errorStatus < 600);
      
      if (isHttpError) {
        const errorMessage = error?.data?.message || error?.message || "Failed to create task";
        toast.error(errorMessage);
      } else {
        // For non-HTTP errors (network issues, etc.), log but don't show error toast
        // The task might have been created successfully
        console.error("Task creation error:", error);
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="max-w-[1200px] mx-auto px-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Task Calendar
          </h1>

          <div className="flex gap-4">
            <select className="px-4 py-2 border border-[#69AE44] rounded-lg bg-[#69AE44]/5 focus:ring-2 focus:ring-[#69AE44] outline-none">
              <option>Admin View</option>
              <option>Employee</option>
            </select>

            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#69AE44] text-white hover:bg-[#5a9a3a]"
            >
              + Add Task
            </button>
          </div>
        </div>

        {/* CALENDAR CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          {/* Month & Year jump */}
          <div className="flex flex-wrap items-center gap-3 mb-3 pb-3 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Go to:</span>
            <select
              value={currentMonth}
              onChange={(e) => goToMonthYear(Number(e.target.value), currentYear)}
              className="px-3 py-2 rounded-lg border border-[#69AE44] bg-[#69AE44]/5 text-sm focus:ring-2 focus:ring-[#69AE44] outline-none"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i}>{name}</option>
              ))}
            </select>
            <select
              value={currentYear}
              onChange={(e) => goToMonthYear(currentMonth, Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-[#69AE44] bg-[#69AE44]/5 text-sm focus:ring-2 focus:ring-[#69AE44] outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 rounded-lg border border-[#69AE44] bg-[#69AE44]/10 text-sm text-gray-700 hover:bg-[#69AE44]/20"
            >
              Today
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[400px] gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#69AE44]"></div>
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-[400px] gap-2">
              <p className="text-red-500 font-semibold">Failed to load tasks</p>
              <p className="text-sm text-gray-600 text-center px-4">
                {error && 'data' in error && error.data
                  ? typeof error.data === 'string'
                    ? error.data
                    : (error.data as any)?.message || JSON.stringify(error.data)
                  : error && 'status' in error
                  ? `Error ${error.status}: ${(error as any).data?.message || 'Request failed'}`
                  : 'Please check your connection and try again'}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-[#69AE44] text-white rounded-lg hover:bg-[#5a9a3a]"
              >
                Retry
              </button>
            </div>
          ) : (
             <>
               <div className="overflow-x-auto -mx-4 sm:mx-0">
                 <div className="min-w-[600px] sm:min-w-0 px-4 sm:px-0">
                   <Calendar
                     localizer={localizer}
                     events={[]}
                     startAccessor="start"
                     endAccessor="end"
                     style={{ height: selectedDate ? 250 : 400 }}
                     date={currentDate}
                     onNavigate={handleNavigate}
                     view={view}
                     onView={setView}
                     views={[Views.MONTH, Views.WEEK, Views.DAY]}
                     selectable
                     onSelectSlot={handleSelectSlot}
                     popup
                   />
                 </div>
               </div>
               {calendarTasks.length === 0 && !isLoading && (
                 <div className="mt-4 text-center text-gray-500 text-sm">
                   No tasks found. Click "+ Add Task" to create one.
                 </div>
               )}
             </>
          )}

        </div>

        {/* TASK TABLE */}
        {selectedDate && (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
    <h2 className="text-xl font-semibold mb-6">
      Tasks for {moment(selectedDate).format("MMMM DD, YYYY")}
    </h2>

    {tasksForSelectedDate.length === 0 ? (
      <p className="text-gray-500">No tasks assigned</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-gray-600">
            <tr>
              <th className="py-3 text-left px-2">Title</th>
              <th className="text-left px-2">Project</th>
              <th className="text-left px-2">Task Type</th>
              <th className="text-left px-2">Assigned To</th>
              <th className="text-left px-2">Department</th>
              <th className="text-left px-2">Start Date</th>
              <th className="text-left px-2">Start Time</th>
              <th className="text-left px-2">End Date</th>
              <th className="text-left px-2">End Time</th>
              <th className="text-left px-2">Priority</th>
              <th className="text-left px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasksForSelectedDate.map((task) => (
              <tr key={task.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2 font-medium">{task.title}</td>
                <td className="px-2">{task.project}</td>
                <td className="px-2">{task.taskType}</td>
                <td className="px-2">{task.assignedTo}</td>
                <td className="px-2">{task.department}</td>
                <td className="px-2">{moment(task.start).format("MMM DD, YYYY")}</td>
                <td className="px-2">{moment(task.start).format("hh:mm A")}</td>
                <td className="px-2">{moment(task.end).format("MMM DD, YYYY")}</td>
                <td className="px-2">{moment(task.end).format("hh:mm A")}</td>
                <td className="px-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      task.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : task.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="px-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      task.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : task.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Create New Task</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Task Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="taskName"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#69AE44]"
                  placeholder="Enter task name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#69AE44] resize-y"
                  placeholder="Enter task description"
                />
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  name="projectId"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#69AE44]"
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Task Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="taskTypeId"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#69AE44]"
                >
                  <option value="">-- Select Task Type --</option>
                  {taskTypes.map((taskType) => (
                    <option key={taskType.id} value={taskType.id}>
                      {taskType.name} ({taskType.department?.name || "General"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <select
                  name="assignedToId"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#69AE44]"
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} {employee.designation ? `(${employee.designation})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#69AE44]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#69AE44]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#69AE44]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#69AE44]"
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                <select
                  name="priority"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#69AE44]"
                >
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="flex-1 px-4 py-2.5 bg-[#69AE44] text-white rounded-lg hover:bg-[#5a9a3a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingTask ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
