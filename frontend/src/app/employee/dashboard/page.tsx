"use client";

import { useAppSelector } from "@/store/hooks";
import { useGetProjectsQuery, type ProjectStatus } from "@/store/api/projectApiSlice";
import { useGetClientsQuery } from "@/store/api/clientApiSlice";
import { useGetTasksQuery, type TaskApi } from "@/store/api/taskApiSlice";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import EmployeesPage from "@/app/admin/employees/page";

const SEARCH_FILTERS = ["All", "Projects", "Clients", "Employee", "Leads", "Sales"];
const QUICK_FILTERS = ["Active", "Inactive", "Pipeline", "Completed", "Total"];

function getDisplayName(email: string | undefined): string {
  if (!email) return "User";
  const part = email.split("@")[0];
  return part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : "User";
}

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [activeBtn, setActiveBtn] = useState("My Active Projects");
  const [searchFilter, setSearchFilter] = useState<string | null>(null);
  const [previousFilter, setPreviousFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectSearchInput, setProjectSearchInput] = useState("");
  const [quickFilter, setQuickFilter] = useState<string>("Active");
  const [clientSearchInput, setClientSearchInput] = useState("");
  const isProjectsView = searchFilter === "Projects";
  const isClientsView = searchFilter === "Clients";
  const isEmployeesView = searchFilter === "Employee";
  const user = useAppSelector((s) => s.auth.currentUser?.user);
  const displayName = (user as { name?: string } | undefined)?.name ?? getDisplayName(user?.email);

  // Restore filter state from sessionStorage when component mounts
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedFilter = sessionStorage.getItem("dashboardFilter");
    if (savedFilter) {
      setSearchFilter(savedFilter);
      sessionStorage.removeItem("dashboardFilter"); // Clear after restoring
    }
  }, []);

  // Handle back button - restore previous filter (go back to "All" or null)
  const handleBack = () => {
    setSearchFilter(null); // Reset to default (All)
    setProjectSearchInput("");
    setSearchQuery("");
  };

  // Track previous filter when filter changes
  const handleFilterChange = (filter: string) => {
    if (filter === "All") {
      // Reset to default state
      setSearchFilter(null);
      setProjectSearchInput("");
      setClientSearchInput("");
      setSearchQuery("");
      return;
    }
    setPreviousFilter(searchFilter); // Save current filter as previous
    setSearchFilter(filter);
    if (filter === "Projects") {
      setProjectSearchInput(searchQuery.trim());
    }
    if (filter === "Clients") {
      setClientSearchInput(searchQuery.trim());
    }
  };

  const buttons = [
    "My Active Projects",
    "Due This Week",
    "My Clients",
    "Open Deals",
  ];

  const projectQuery = useMemo(() => {
    const params: { status?: ProjectStatus; search?: string; limit: number; page: number } = {
      limit: 100,
      page: 1,
    };
    const hasSearch = projectSearchInput.trim().length > 0;
    if (!hasSearch) {
      if (quickFilter === "Active") params.status = "Active";
      else if (quickFilter === "Inactive") params.status = "Draft";
      else if (quickFilter === "Completed") params.status = "Completed";
      else if (quickFilter === "Pipeline") params.status = "Draft";
    }
    if (hasSearch) params.search = projectSearchInput.trim();
    return params;
  }, [quickFilter, projectSearchInput]);

  const { data, isLoading, isError } = useGetProjectsQuery(projectQuery, {
    skip: !isProjectsView,
  });
  const activeCount = data?.data?.filter((p) => p.status === "Active").length ?? 0;
  const draftCount = data?.data?.filter((p) => p.status === "Draft").length ?? 0;
  const totalCount = data?.meta?.totalItems ?? data?.data?.length ?? 0;

  // Fetch clients data
  const { data: clientsData, isLoading: isLoadingClients, isError: isErrorClients } = useGetClientsQuery(undefined, {
    skip: !isClientsView,
  });
  const clients = clientsData || [];
  const filteredClients = useMemo(() => {
    if (!clientSearchInput.trim()) return clients;
    const search = clientSearchInput.toLowerCase();
    return clients.filter(
      (client) =>
        client.name?.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.clientCode?.toLowerCase().includes(search)
    );
  }, [clients, clientSearchInput]);

  // Get today's date in YYYY-MM-DD format
  const todayDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Fetch all tasks for today
  const { data: todayTasksData, isLoading: isLoadingTodayTasks } = useGetTasksQuery(
    {
      date: todayDate,
      limit: 50,
      sortBy: "startDate",
      sortOrder: "ASC",
    },
    {
      skip: isProjectsView || isClientsView || isEmployeesView,
    }
  );

  // Format time from HH:mm to 12-hour format
  const formatTime = (timeStr: string | undefined): string => {
    if (!timeStr) return "";
    try {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
    } catch {
      return timeStr;
    }
  };

  // Format task for schedule display
  const formatTaskForSchedule = (task: TaskApi) => {
    const taskName = task.task_taskName || task.task_taskname || (task as any).name || "Untitled Task";
    const startDate = task.task_startDate || task.task_startdate || (task as any).startDate || "";
    const startTime = task.task_startTime || task.task_starttime || (task as any).startTime || "";
    const endTime = task.task_endTime || task.task_endtime || (task as any).endTime || "";
    const projectName = task.project_projectName || task.project_projectname || (task as any).project?.name || "";
    const assignedToName = task.assignedTo_name || task.assignedto_name || (task as any).assignedTo?.name || "";
    const priority = (task as any).priority || (task as any).task_priority || "Medium";

    // Format time range
    let timeDisplay = "";
    if (startTime && endTime) {
      const start = formatTime(startTime);
      const end = formatTime(endTime);
      timeDisplay = `${start} - ${end}`;
    } else if (startTime) {
      timeDisplay = formatTime(startTime);
    } else {
      timeDisplay = "All Day";
    }

    // Format details line
    const details = [projectName, assignedToName].filter(Boolean).join(" • ") || "Task";

    return {
      id: task.task_id || (task as any).id,
      time: timeDisplay,
      title: taskName,
      details,
      projectId: task.project_projectId || task.project_projectid || (task as any).project?.id,
      priority: priority as "High" | "Medium" | "Low",
    };
  };

  // Sort tasks by priority: High > Medium > Low, then by start time
  const todayTasks = useMemo(() => {
    if (!todayTasksData || todayTasksData.length === 0) return [];
    
    const formatted = todayTasksData.map(formatTaskForSchedule);
    
    // Priority order: High = 0, Medium = 1, Low = 2
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    
    return formatted.sort((a, b) => {
      // First sort by priority
      const priorityDiff = (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by time
      return a.time.localeCompare(b.time);
    });
  }, [todayTasksData]);

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      {/* Back Button - Always reserve space to prevent layout shift */}
      <div className="mb-4 pl-8 h-10">
        {(isProjectsView || isClientsView || isEmployeesView) && (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      {/* WIDER CONTAINER */}
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Top Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Good morning, {displayName}
          </h2>
          <p className="text-base text-gray-500 mt-2">
            Search across projects, clients, resources, leads, and sales
          </p>

          {/* Search Row */}
          <div className="flex items-center gap-4 mt-6">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPreviousFilter(searchFilter);
                  setProjectSearchInput(searchQuery.trim());
                  setSearchFilter("Projects");
                }
              }}
              className="flex-1 px-5 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="flex bg-gray-100 p-1.5 rounded-xl">
              {SEARCH_FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleFilterChange(item)}
                  className={`px-5 py-3 text-base rounded-lg transition-colors ${
                    (item === "All" && searchFilter === null) || searchFilter === item
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setProjectSearchInput(searchQuery.trim());
                setSearchFilter("Projects");
              }}
              className="bg-green-600 text-white px-8 py-4 rounded-xl text-base font-medium hover:bg-green-700"
            >
              Search
            </button>
          </div>

          {/* Quick Buttons */}
          <div className="flex gap-4 mt-5">
            {buttons.map((btn) => (
              <button
                key={btn}
                onClick={() => {
                  setActiveBtn(btn);
                  if (btn === "My Clients") {
                    setSearchFilter("Clients");
                  }
                }}
                className={`px-6 py-3 rounded-xl text-base transition-all duration-200 border ${
                  activeBtn === btn
                    ? "border-[#69AE44] bg-[#69AE44]/10 text-[#69AE44]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#69AE44] hover:text-[#69AE44]"
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards - Hide when Projects, Clients, or Employees view is active */}
        {!isProjectsView && !isClientsView && !isEmployeesView && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
              <p className="text-base text-gray-500">Active Projects</p>
              <h3 className="text-3xl font-semibold text-gray-900 mt-3">12</h3>
              <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">↑ 3 from last week</p>
            </div>
            <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
              <p className="text-base text-gray-500">Tasks This Week</p>
              <h3 className="text-3xl font-semibold text-gray-900 mt-3">24</h3>
              <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">↑ 8 completed</p>
            </div>
            <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
              <p className="text-base text-gray-500">Hours Logged</p>
              <h3 className="text-3xl font-semibold text-gray-900 mt-3">32h</h3>
              <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">↑ 4h from last week</p>
            </div>
            <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
              <p className="text-base text-gray-500">Team Members</p>
              <h3 className="text-3xl font-semibold text-gray-900 mt-3">8</h3>
              <p className="text-sm text-gray-500 mt-2">No change</p>
            </div>
          </div>
        )}

        {/* Projects View Section */}
        {isProjectsView && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Projects</h3>
              {/* No "Create New Project" button for employees */}
            </div>

            <div className="mt-2 flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search projects..."
                value={projectSearchInput}
                onChange={(e) => setProjectSearchInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              />
              <button
                type="button"
                className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 shrink-0"
              >
                Search
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              {QUICK_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setQuickFilter(filter)}
                  className={`px-4 py-2 rounded-xl border text-sm transition-colors ${
                    quickFilter === filter
                      ? "border-green-500 text-green-700 bg-green-50"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6 mb-6">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{activeCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Inactive</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{draftCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Pipeline</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{totalCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">—</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">—</p>
              </div>
            </div>

            {isLoading && <div className="text-gray-500 py-6">Loading projects...</div>}
            {isError && <div className="text-red-600 py-6">Failed to load projects.</div>}
            {!isLoading && !isError && (data?.data?.length ?? 0) === 0 && (
              <div className="text-gray-500 py-6">No projects found.</div>
            )}
            {!isLoading && !isError && (data?.data?.length ?? 0) > 0 && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {data?.data.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      // Save current filter state before navigating
                      if (typeof window !== "undefined" && searchFilter) {
                        sessionStorage.setItem("dashboardFilter", searchFilter);
                      }
                      router.push(`/employee/dashboard/projects/${project.id}`);
                    }}
                    className="w-full text-left rounded-xl border border-gray-200 p-5 hover:border-green-500 transition-colors group relative"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl group-hover:bg-green-600" />
                    <div className="pl-4">
                      <p className="text-sm text-gray-500">{project.code || "—"}</p>
                      <p className="text-base font-semibold text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.type} • {project.status}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clients View Section */}
        {isClientsView && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Clients</h3>
              {/* No "Create New Client" button for employees */}
            </div>

            <div className="mt-2 flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search clients..."
                value={clientSearchInput}
                onChange={(e) => setClientSearchInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              />
              <button
                type="button"
                className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 shrink-0"
              >
                Search
              </button>
            </div>

            {isLoadingClients && <div className="text-gray-500 py-6">Loading clients...</div>}
            {isErrorClients && <div className="text-red-600 py-6">Failed to load clients.</div>}
            {!isLoadingClients && !isErrorClients && filteredClients.length === 0 && (
              <div className="text-gray-500 py-6">No clients found.</div>
            )}
            {!isLoadingClients && !isErrorClients && filteredClients.length > 0 && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 mt-6">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      // Save current filter state before navigating
                      if (typeof window !== "undefined" && searchFilter) {
                        sessionStorage.setItem("dashboardFilter", searchFilter);
                      }
                      router.push(`/employee/dashboard/clients/${client.id}`);
                    }}
                    className="w-full text-left rounded-xl border border-gray-200 p-5 hover:border-green-500 transition-colors group relative"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl group-hover:bg-green-600" />
                    <div className="pl-4">
                      <p className="text-sm text-gray-500">{client.clientCode || "—"}</p>
                      <p className="text-base font-semibold text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.email || "—"} • {client.status ? "Active" : "Inactive"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Employees View Section */}
        {isEmployeesView && (
          <div className="mt-8">
            <EmployeesPage />
          </div>
        )}

        {/* BELOW DASHBOARD SECTION */}
        {!isProjectsView && !isClientsView && !isEmployeesView && (
          <div className="mt-10">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h3>
                <button
                  type="button"
                  onClick={() => router.push("/employee/dashboard/tasks")}
                  className="text-green-600 text-sm font-medium hover:underline"
                >
                  View Calendar
                </button>
              </div>
              <div className="space-y-4">
                {isLoadingTodayTasks ? (
                  <div className="text-center py-8 text-gray-500">Loading tasks...</div>
                ) : todayTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No tasks scheduled for today</div>
                ) : (
                  todayTasks.map((task) => {
                    // Determine border color based on priority
                    const borderColorClass = 
                      task.priority === "High" ? "border-l-red-500 hover:border-l-red-700" :
                      task.priority === "Medium" ? "border-l-amber-500 hover:border-l-amber-700" :
                      "border-l-green-500 hover:border-l-green-700";
                    
                    // Priority label
                    const priorityLabel = 
                      task.priority === "High" ? "High Priority" :
                      task.priority === "Medium" ? "Medium Priority" :
                      "Low Priority";
                    
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => {
                          if (task.projectId && task.id) {
                            router.push(`/employee/dashboard/projects/${task.projectId}/tasks/${task.id}`);
                          }
                        }}
                        className={`w-full text-left flex gap-4 p-5 border-t border-r border-b border-gray-200 border-l-4 ${borderColorClass} rounded-xl transition-colors cursor-pointer hover:bg-gray-50`}
                      >
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">{task.time}</p>
                          <p className="font-medium text-gray-900 mt-1">{task.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{task.details} • {priorityLabel}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
