"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useGetProjectQuery } from "@/store/api/projectApiSlice";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  mapFrontendToBackendStatus,
} from "@/store/api/taskApiSlice";
import { useGetEmployeesQuery } from "@/store/api/employeeApiSlice";
import { useGetTaskTypesQuery } from "@/store/api/taskTypeApiSlice";
import type { TaskDepartment, CreateTaskFormData, TaskStatus } from "./_components/taskTypes";
import { INITIAL_TASK_DEPARTMENTS, TASK_TYPE_TO_SUBSECTION } from "./_components/taskData";
import { transformTasksToDepartments } from "./_utils/taskTransformers";
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

  // Fetch tasks filtered by projectId (backend supports projectId filter)
  const {
    data: allTasksData,
    isLoading: isLoadingTasks,
    isError: isTasksError,
    error: tasksError,
    refetch: refetchTasks,
  } = useGetTasksQuery(
    projectId ? { projectId, limit: 1000 } : undefined,
    { skip: !projectId }
  );

  // Transform tasks to handle both entity objects and raw query results
  // Backend returns entity objects: { id, name, project: { id, name }, ... }
  // But frontend expects raw query results with aliases
  const tasksData = useMemo(() => {
    if (!allTasksData || !projectId) return undefined;
    
    // Debug: Log first task to see structure
    if (allTasksData.length > 0 && process.env.NODE_ENV === 'development') {
      console.log('Sample task structure:', allTasksData[0]);
      console.log('Looking for projectId:', projectId);
    }
    
    // Transform entity objects to raw query format if needed
    // Backend returns entity objects: { id, name, project: { id, name }, assignedTo: { id, name }, ... }
    const transformedTasks = allTasksData.map((task: any) => {
      // If task is already in raw format (has task_id), return as is
      if (task.task_id) {
        return task;
      }
      
      // If task is an entity object, transform it to raw format
      // This handles the case where backend returns entities instead of raw query results
      const transformed: any = {
        task_id: task.id,
        task_taskName: task.name,
        task_taskname: task.name,
        task_taskDescription: task.description,
        task_taskdescription: task.description,
        task_taskStatus: task.status,
        task_taskstatus: task.status,
        task_startDate: task.startDate,
        task_startdate: task.startDate,
        task_startTime: task.startTime,
        task_starttime: task.startTime,
        task_endDate: task.endDate,
        task_enddate: task.endDate,
        task_endTime: task.endTime,
        task_endtime: task.endTime,
        task_createdAt: task.createdAt,
        task_createdat: task.createdAt,
        task_updatedAt: task.updatedAt,
        task_updatedat: task.updatedAt,
        // Project fields
        project_projectId: task.project?.id || task.projectId,
        project_projectid: task.project?.id || task.projectId,
        project_id: task.project?.id || task.projectId,
        projectId: task.project?.id || task.projectId,
        project_projectName: task.project?.name,
        project_projectname: task.project?.name,
        // AssignedTo fields
        assignedTo_id: task.assignedTo?.id,
        assignedTo_name: task.assignedTo?.name,
        assignedto_id: task.assignedTo?.id,
        assignedto_name: task.assignedTo?.name,
        assignedTo_designation: task.assignedTo?.designation,
        assignedto_designation: task.assignedTo?.designation,
        // AssignedBy fields
        assignedBy_id: task.assignedBy?.id,
        assignedBy_name: task.assignedBy?.name,
        assignedby_id: task.assignedBy?.id,
        assignedby_name: task.assignedBy?.name,
        // Keep original fields as fallback
        ...task,
      };
      
      return transformed;
    });
    
    // Filter by projectId (backend should filter, but double-check)
    const filtered = transformedTasks.filter((task: any) => {
      const taskProjectId = 
        task.project_projectId || 
        task.project_projectid || 
        task.project_id || 
        task.projectId ||
        (task.project && task.project.id);
      
      if (process.env.NODE_ENV === 'development' && transformedTasks.length > 0 && transformedTasks.indexOf(task) === 0) {
        console.log('Task projectId fields:', {
          project_projectId: task.project_projectId,
          project_projectid: task.project_projectid,
          project_id: task.project_id,
          projectId: task.projectId,
          project: task.project,
          found: taskProjectId,
          matches: taskProjectId === projectId
        });
      }
      
      return taskProjectId === projectId;
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Filtered ${filtered.length} tasks from ${transformedTasks.length} total tasks for project ${projectId}`);
    }
    
    return filtered;
  }, [allTasksData, projectId]);
  

  // Fetch employees for task assignment
  const { data: employeesData } = useGetEmployeesQuery({ limit: 100 });

  // Fetch task types for task creation
  const { data: taskTypesData } = useGetTaskTypesQuery();

  // Task mutations
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTaskStatus, { isLoading: isUpdatingStatus }] = useUpdateTaskStatusMutation();

  const [activeTab, setActiveTab] = useState("Project Info");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [departments, setDepartments] = useState<TaskDepartment[]>(INITIAL_TASK_DEPARTMENTS);
  const departmentsRef = useRef<TaskDepartment[]>(INITIAL_TASK_DEPARTMENTS);

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
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  // Track previous tasks data to prevent unnecessary updates
  const prevTasksDataRef = useRef<any[] | undefined>(undefined);
  const prevTasksDataLengthRef = useRef<number>(0);

  // Transform backend tasks to frontend format when tasks data or taskTypes change
  useEffect(() => {
    // Skip if tasksData hasn't actually changed (reference equality check)
    if (tasksData === prevTasksDataRef.current) {
      return;
    }
    
    // Also check if length changed (simple check to prevent unnecessary updates)
    const currentLength = tasksData?.length ?? 0;
    if (tasksData === undefined && prevTasksDataRef.current === undefined) {
      return;
    }
    
    prevTasksDataRef.current = tasksData;
    prevTasksDataLengthRef.current = currentLength;

    if (tasksData && tasksData.length > 0) {
      // Only transform if taskTypes are loaded (needed for department mapping)
      if (!taskTypesData || taskTypesData.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('TaskTypes not loaded yet, skipping transformation. Will retry when taskTypes are available.');
        }
        return;
      }
      
      const transformed = transformTasksToDepartments(tasksData, INITIAL_TASK_DEPARTMENTS, taskTypesData);
      setDepartments(transformed);
      departmentsRef.current = transformed;

      // Update completed task IDs - preserve manual changes unless task was removed
      setCompletedTaskIds((prevCompletedIds) => {
        const backendCompletedIds = new Set<string>();
        const allTaskIds = new Set<string>();
        
        transformed.forEach((d) =>
          d.subSections.forEach((s) => {
            s.tasks.forEach((t) => {
              allTaskIds.add(t.id);
              if (t.isComplete) {
                backendCompletedIds.add(t.id);
              }
            });
          })
        );
        
        // Merge: keep manually toggled tasks that still exist, add backend-completed tasks
        const merged = new Set<string>();
        
        // Add backend-completed tasks
        backendCompletedIds.forEach((id) => merged.add(id));
        
        // Preserve manual toggles for tasks that still exist
        prevCompletedIds.forEach((id) => {
          if (allTaskIds.has(id)) {
            merged.add(id);
          }
        });
        
        // Only update if actually changed
        if (
          merged.size !== prevCompletedIds.size ||
          Array.from(merged).some((id) => !prevCompletedIds.has(id)) ||
          Array.from(prevCompletedIds).some((id) => !merged.has(id))
        ) {
          return merged;
        }
        
        return prevCompletedIds;
      });

      // Only initialize expanded states if they're empty (first load)
      // Don't reset them if user has manually expanded/collapsed
      setExpandedDepts((prev) => {
        const hasAnyExpanded = Object.keys(prev).length > 0;
        if (hasAnyExpanded) {
          // Preserve existing state, but add any new departments
          const newState = { ...prev };
          let changed = false;
          transformed.forEach((d) => {
            if (!(d.name in newState)) {
              newState[d.name] = true; // Default new departments to expanded
              changed = true;
            }
          });
          return changed ? newState : prev;
        }
        // First load - initialize all to expanded
        return Object.fromEntries(transformed.map((d) => [d.name, true]));
      });

      setExpandedSubSections((prev) => {
        const hasAnyExpanded = Object.keys(prev).length > 0;
        if (hasAnyExpanded) {
          // Preserve existing state, but add any new subsections
          const newState = { ...prev };
          let changed = false;
          transformed.forEach((d) =>
            d.subSections.forEach((s) => {
              const key = `${d.name}::${s.name}`;
              if (!(key in newState)) {
                newState[key] = true; // Default new subsections to expanded
                changed = true;
              }
            })
          );
          return changed ? newState : prev;
        }
        // First load - initialize all to expanded
        const subMap: Record<string, boolean> = {};
        transformed.forEach((d) =>
          d.subSections.forEach((s) => {
            subMap[`${d.name}::${s.name}`] = true;
          })
        );
        return subMap;
      });
    } else if (tasksData && tasksData.length === 0) {
      // No tasks, use initial empty structure
      setDepartments((prevDepts) => {
        if (prevDepts.length === INITIAL_TASK_DEPARTMENTS.length) {
          return prevDepts;
        }
        departmentsRef.current = INITIAL_TASK_DEPARTMENTS;
        return INITIAL_TASK_DEPARTMENTS;
      });
    }
  }, [tasksData, taskTypesData]); // Also depend on taskTypesData

  const toggleTaskComplete = useCallback((taskId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      const wasComplete = next.has(taskId);
      
      if (wasComplete) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      
      return next;
    });
    
    // Also update the task's visual state in departments immediately
    setDepartments((prevDepts) => {
      const updated = prevDepts.map((dept) => ({
        ...dept,
        subSections: dept.subSections.map((sub) => ({
          ...sub,
          tasks: sub.tasks.map((task) =>
            task.id === taskId
              ? { ...task, isComplete: !task.isComplete, status: (!task.isComplete ? "Closed" : "In Progress") as TaskStatus }
              : task
          ),
        })),
      }));
      departmentsRef.current = updated;
      return updated;
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
    const currentDepts = departmentsRef.current;
    const deptMap: Record<string, boolean> = {};
    const subMap: Record<string, boolean> = {};
    
    currentDepts.forEach((d) => {
      deptMap[d.name] = true;
      d.subSections.forEach((s) => {
        subMap[`${d.name}::${s.name}`] = true;
      });
    });
    
    setExpandedDepts(deptMap);
    setExpandedSubSections(subMap);
  }, []);

  const collapseAll = useCallback(() => {
    const currentDepts = departmentsRef.current;
    const deptMap: Record<string, boolean> = {};
    
    currentDepts.forEach((d) => {
      deptMap[d.name] = false;
    });
    
    setExpandedDepts(deptMap);
    setExpandedSubSections({});
  }, []);

  const handleCreateTask = useCallback(
    async (formData: CreateTaskFormData) => {
      if (!projectId || !employeesData?.data) {
        toast.error("Project ID or employees data not available");
        return;
      }

      if (!taskTypesData || taskTypesData.length === 0) {
        toast.error("Task types not available. Please try again.");
        return;
      }

      // Find employee ID from name
      const employee = employeesData.data.find(
        (emp) => emp.name === formData.assignTo || `${emp.name}` === formData.assignTo
      );

      if (!employee) {
        toast.error(`Employee "${formData.assignTo}" not found`);
        console.error("Available employees:", employeesData.data.map(e => ({ name: e.name, id: e.id })));
        return;
      }

      // Debug: Log employee details
      if (process.env.NODE_ENV === 'development') {
        console.log("Selected employee:", { name: employee.name, id: employee.id });
        console.log("All employees:", employeesData.data.map(e => ({ name: e.name, id: e.id })));
      }

      // Find task type ID from name
      const taskType = taskTypesData.find(
        (tt) => tt.name === formData.taskType
      );

      if (!taskType) {
        toast.error(`Task type "${formData.taskType}" not found`);
        return;
      }

      // Parse due date and set start/end dates
      const dueDate = new Date(formData.dueDate);
      const startDate = new Date(dueDate);
      startDate.setDate(startDate.getDate() - 1); // Start 1 day before due date

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = dueDate.toISOString().split("T")[0];

      // Map priority string to backend enum value
      const priorityMap: Record<string, "Low" | "Medium" | "High"> = {
        Low: "Low",
        Medium: "Medium",
        High: "High",
      };
      const priority = priorityMap[formData.priority] || "Medium";

      try {
        // Store department and taskType in taskDescription as JSON metadata
        // Format: JSON string with department and taskType
        const taskDescription = JSON.stringify({
          department: formData.department,
          taskType: formData.taskType,
          originalDescription: formData.taskName,
        });

        // Create task via Redux Toolkit mutation
        // This will automatically invalidate the Task cache and trigger refetch
        const taskPayload = {
          name: formData.taskName, // Backend expects 'name'
          description: taskDescription, // Use task name as description, or you can add a description field to the form
          startDate: startDateStr,
          startTime: "09:00",
          endDate: endDateStr,
          endTime: "18:00",
          assignedToId: employee.id,
          projectId: projectId,
          priority: priority,
          taskTypeId: taskType.id, // Required by backend
        };

        // Debug: Log the payload being sent
        if (process.env.NODE_ENV === 'development') {
          console.log("Creating task with payload:", taskPayload);
        }

        const result = await createTask(taskPayload).unwrap();

        toast.success("Task created successfully");
        
        // Close modal immediately
        setIsCreateTaskOpen(false);
        
        // RTK Query will automatically refetch due to cache invalidation,
        // but we also manually refetch to ensure immediate update
        // Add a small delay to ensure backend has processed the creation
        setTimeout(async () => {
          try {
            await refetchTasks();
            console.log("Tasks refetched after creation");
          } catch (error) {
            console.error("Error refetching tasks:", error);
          }
        }, 500);
      } catch (error: any) {
        console.error("Failed to create task:", error);
        console.error("Error details:", {
          message: error?.data?.message,
          status: error?.status,
          data: error?.data,
          employeeId: employee?.id,
          employeeName: employee?.name,
        });
        
        // Show more specific error message
        const errorMessage = error?.data?.message || error?.message || "Failed to create task";
        toast.error(errorMessage);
        
        // If it's an assignedTo ID error, show helpful message
        if (errorMessage.includes("assignedTo") || errorMessage.includes("assigned")) {
          toast.error(`Employee ID "${employee?.id}" not found in database. Please check employee data.`);
        }
      }
    },
    [projectId, employeesData, taskTypesData, createTask, refetchTasks]
  );

  if (!projectId) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <p className="text-gray-600">Invalid project ID</p>
      </div>
    );
  }

  if (isLoading || isLoadingTasks) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <p className="text-gray-600">Loading project and tasks…</p>
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
            <span className="text-green-600">{project.name}</span>
          </div>
        </div>
      </div>

      {/* Scrollable: Content */}
      <div className="scrollbar-hide flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-8 pb-10">
          {activeTab === "Project Documents" ? (
            <ProjectDocuments />
          ) : isTasksError ? (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 font-medium mb-2">⚠️ Failed to load tasks</p>
              <p className="text-yellow-700 text-sm mb-4">
                {(tasksError as { data?: { message?: string } })?.data?.message || "Unable to fetch tasks from the server."}
              </p>
              <button
                onClick={() => refetchTasks()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                🔄 Retry
              </button>
            </div>
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
