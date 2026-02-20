import type { TaskApi } from "@/store/api/taskApiSlice";
import { mapBackendToFrontendStatus } from "@/store/api/taskApiSlice";
import type { Task, TaskDepartment, TaskSubSection } from "../_components/taskTypes";
import { TASK_TYPE_TO_SUBSECTION } from "../_components/taskData";

/**
 * Transform backend task API response to frontend Task format
 */
export function transformBackendTaskToFrontend(backendTask: TaskApi): Task {
  // Handle TypeORM QueryBuilder getRawMany format with explicit aliases
  // Backend now uses camelCase aliases: task_taskName, task_taskDescription, etc.
  const taskId = backendTask.task_id || "";
  const taskName = backendTask.task_taskName || backendTask.task_taskname || "";
  const taskStatus = (backendTask.task_taskStatus || backendTask.task_taskstatus || "IN_PROGRESS") as any;
  const startDate = backendTask.task_startDate || backendTask.task_startdate || "";
  const taskDescription = backendTask.task_taskDescription || backendTask.task_taskdescription || (backendTask as any).task_description || "";
  const assignedToName = backendTask.assignedTo_name || backendTask.assignedto_name || "Unknown";
  
  // Extract original description from metadata if stored as JSON
  let displayDescription = taskName;
  try {
    if (taskDescription) {
      const metadata = JSON.parse(taskDescription);
      if (metadata.originalDescription) {
        displayDescription = metadata.originalDescription;
      }
    }
  } catch {
    // If not JSON, use taskName as is
  }

  // Extract initials from name (first letter of first name + first letter of last name)
  const nameParts = assignedToName?.split(" ") || [];
  const initials = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : nameParts[0]?.substring(0, 2).toUpperCase() || "??";

  // Format date (extract date part from start_date)
  const date = startDate ? formatDate(startDate) : "";

  // Map backend status to frontend status
  const frontendStatus = mapBackendToFrontendStatus(taskStatus as any);

  // Determine if task is complete (Closed status means complete)
  const isComplete = frontendStatus === "Closed";

  // Generate assignee color based on name hash (consistent colors)
  const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];
  const colorIndex = (assignedToName?.length || 0) % colors.length;
  const assigneeColor = colors[colorIndex];

  return {
    id: taskId,
    description: displayDescription,
    assignee: {
      initials,
      name: assignedToName,
    },
    assigneeColor,
    status: frontendStatus,
    date,
    isComplete,
  };
}

/**
 * Format date string (YYYY-MM-DD) to short format (MMM DD)
 */
function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = parseInt(month || "1", 10) - 1;
    return `${months[monthIndex] || month} ${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * Transform backend tasks array to TaskDepartment structure
 * Groups tasks by department (which we'll infer from task type or use a default)
 */
export function transformTasksToDepartments(
  backendTasks: TaskApi[],
  departments: TaskDepartment[]
): TaskDepartment[] {
  // Create a map of department names to their structures
  const deptMap = new Map<string, TaskDepartment>();
  
  // Initialize departments from existing structure
  departments.forEach((dept) => {
    deptMap.set(dept.name, {
      ...dept,
      subSections: dept.subSections.map((sub) => ({ ...sub, tasks: [] })),
      taskCount: 0,
      progress: 0,
    });
  });

  // Group tasks by department and subsection
  // Parse department and taskType from taskDescription (stored as JSON)
  backendTasks.forEach((backendTask) => {
    // Handle different column name formats (PostgreSQL returns lowercase)
    const projectId = backendTask.project_projectid || backendTask.project_projectId || (backendTask as any).project_id || (backendTask as any).projectId || "";
    const taskDescription = backendTask.task_taskdescription || backendTask.task_taskDescription || (backendTask as any).task_description || "";
    
    // Try to parse department and taskType from taskDescription
    let deptName = departments[0]?.name || "Sales";
    let taskType = "";
    
    try {
      if (taskDescription) {
        const metadata = JSON.parse(taskDescription);
        if (metadata.department) {
          deptName = metadata.department;
        }
        if (metadata.taskType) {
          taskType = metadata.taskType;
        }
      }
    } catch {
      // If parsing fails, taskDescription might be plain text (old format)
      // Default to first department
    }
    
    const dept = deptMap.get(deptName);
    
    if (!dept) {
      // If department not found, use first department as fallback
      const fallbackDept = deptMap.get(departments[0]?.name || "Sales");
      if (!fallbackDept) return;
      
      // Add to first subsection of fallback department
      const subsection = fallbackDept.subSections[0];
      if (subsection) {
        const frontendTask = transformBackendTaskToFrontend(backendTask);
        subsection.tasks.push(frontendTask);
      }
      return;
    }

    // Map taskType to subsection using TASK_TYPE_TO_SUBSECTION
    let subsectionName = "";
    if (taskType) {
      subsectionName = TASK_TYPE_TO_SUBSECTION[taskType] || "";
    }
    
    // Find the matching subsection, or use first one as fallback
    let subsection = subsectionName 
      ? dept.subSections.find((s) => s.name === subsectionName)
      : null;
    
    if (!subsection && dept.subSections.length > 0) {
      subsection = dept.subSections[0];
    }

    if (subsection) {
      const frontendTask = transformBackendTaskToFrontend(backendTask);
      subsection.tasks.push(frontendTask);
    }
  });

  // Calculate task counts and progress for each department
  deptMap.forEach((dept) => {
    let totalTasks = 0;
    let completedTasks = 0;

    dept.subSections.forEach((sub) => {
      totalTasks += sub.tasks.length;
      completedTasks += sub.tasks.filter((t) => t.isComplete).length;
    });

    dept.taskCount = totalTasks;
    dept.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  });

  return Array.from(deptMap.values());
}
