import type { TaskApi } from "@/store/api/taskApiSlice";
import { mapBackendToFrontendStatus } from "@/store/api/taskApiSlice";
import type { Task, TaskDepartment, TaskSubSection } from "../_components/taskTypes";
import { TASK_TYPE_TO_SUBSECTION } from "../_components/taskData";
import type { TaskTypeApi } from "@/store/api/taskTypeApiSlice";

/**
 * Transform backend task API response to frontend Task format
 */
export function transformBackendTaskToFrontend(backendTask: TaskApi): Task {
  // Handle both formats:
  // 1. Raw query results (getRawMany): task_taskName, project_projectId, etc.
  // 2. Entity objects (getMany): { id, name, project: { id, name }, ... }
  
  // Check if it's an entity object (has direct 'id' and 'name' fields)
  const isEntityObject = !backendTask.task_id && (backendTask as any).id;
  
  let taskId: string;
  let taskName: string;
  let taskStatus: any;
  let startDate: string;
  let taskDescription: string;
  let assignedToName: string;
  
  if (isEntityObject) {
    // Entity object format
    const entity = backendTask as any;
    taskId = entity.id || "";
    taskName = entity.name || "";
    taskStatus = entity.status || "IN_PROGRESS";
    startDate = entity.startDate || "";
    taskDescription = entity.description || "";
    assignedToName = entity.assignedTo?.name || entity.assigned_to?.name || "Unknown";
  } else {
    // Raw query result format
    taskId = backendTask.task_id || "";
    taskName = backendTask.task_taskName || backendTask.task_taskname || "";
    taskStatus = (backendTask.task_taskStatus || backendTask.task_taskstatus || "IN_PROGRESS") as any;
    startDate = backendTask.task_startDate || backendTask.task_startdate || "";
    taskDescription = backendTask.task_taskDescription || backendTask.task_taskdescription || (backendTask as any).task_description || "";
    assignedToName = backendTask.assignedTo_name || backendTask.assignedto_name || "Unknown";
  }
  
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
  departments: TaskDepartment[],
  taskTypes?: TaskTypeApi[]
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

  // Create a map of taskType.id -> taskType for quick lookup
  const taskTypeMap = new Map<string, TaskTypeApi>();
  if (taskTypes && taskTypes.length > 0) {
    taskTypes.forEach((tt) => {
      taskTypeMap.set(tt.id, tt);
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Created taskType map with ${taskTypeMap.size} task types`);
      // Log first few taskTypes to verify they have departments
      taskTypes.slice(0, 3).forEach((tt) => {
        console.log(`TaskType: ${tt.name}, Department: ${tt.department?.name || 'NO DEPARTMENT'}`);
      });
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.warn('No taskTypes provided to transformTasksToDepartments');
    }
  }

  // Group tasks by department and subsection
  // Use taskType to determine department (frontend-only solution since backend doesn't return description)
  backendTasks.forEach((backendTask, index) => {
    // Handle different column name formats (PostgreSQL returns lowercase)
    // Backend query uses 'project.id' which becomes 'project_id' in raw results
    const projectId = 
      backendTask.project_projectid || 
      backendTask.project_projectId || 
      (backendTask as any).project_id || 
      (backendTask as any).projectId ||
      (backendTask as any).project?.id ||
      "";
    
    // Get taskType from backend task (entity object format)
    const taskTypeId = 
      (backendTask as any).taskType_id ||
      (backendTask as any).taskTypeId ||
      (backendTask as any).taskType?.id ||
      "";
    const taskTypeName = 
      (backendTask as any).taskType_name ||
      (backendTask as any).taskTypeName ||
      (backendTask as any).taskType?.name ||
      "";
    
    // Try to get department from taskType
    let deptName = departments[0]?.name || "Sales";
    let taskType = taskTypeName;
    
    if (process.env.NODE_ENV === 'development' && index === 0) {
      console.log('Processing task:', {
        taskName: (backendTask as any).name || (backendTask as any).task_name,
        taskTypeId,
        taskTypeName,
        taskTypeMapSize: taskTypeMap.size,
        hasTaskTypeInMap: taskTypeId ? taskTypeMap.has(taskTypeId) : false
      });
    }
    
    if (taskTypeId && taskTypeMap.has(taskTypeId)) {
      const taskTypeData = taskTypeMap.get(taskTypeId)!;
      if (taskTypeData.department?.name) {
        deptName = taskTypeData.department.name;
        taskType = taskTypeData.name;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Task "${(backendTask as any).name || (backendTask as any).task_name}" → Department: ${deptName} (from taskType: ${taskTypeData.name})`);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ TaskType "${taskTypeData.name}" has no department, using default: ${deptName}`);
        }
      }
    } else {
      // Fallback: Try to parse from description if available (for backwards compatibility)
      const taskDescription = 
        backendTask.task_taskdescription || 
        backendTask.task_taskDescription || 
        (backendTask as any).task_description ||
        (backendTask as any).description ||
        "";
      
      if (taskDescription) {
        try {
          const metadata = JSON.parse(taskDescription);
          if (metadata.department) {
            deptName = metadata.department;
          }
          if (metadata.taskType) {
            taskType = metadata.taskType;
          }
        } catch (error) {
          // If parsing fails, use defaults
        }
      }
      
      if (process.env.NODE_ENV === 'development' && index === 0) {
        console.warn('Could not find taskType in map, using fallback:', {
          taskTypeId,
          taskTypeName,
          deptName
        });
      }
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
      
      if (process.env.NODE_ENV === 'development' && index === 0) {
        console.log('Task added to:', { deptName, subsectionName: subsection.name, taskName: frontendTask.description });
      }
    } else {
      if (process.env.NODE_ENV === 'development' && index === 0) {
        console.warn('No subsection found for task:', { deptName, taskType, subsectionName });
      }
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
    
    if (process.env.NODE_ENV === 'development' && totalTasks > 0) {
      console.log(`Department ${dept.name}: ${totalTasks} tasks across ${dept.subSections.length} subsections`);
      dept.subSections.forEach((sub) => {
        if (sub.tasks.length > 0) {
          console.log(`  - ${sub.name}: ${sub.tasks.length} tasks`);
        }
      });
    }
  });

  return Array.from(deptMap.values());
}
