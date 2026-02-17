export type TaskStatus = "Closed" | "In Progress" | "Open" | "On-Hold";

export type TaskPriority = "Low" | "Medium" | "High";

export type Task = {
  id: string;
  description: string;
  assignee: { initials: string; name: string };
  assigneeColor: string;
  status: TaskStatus;
  date: string;
  isComplete: boolean;
};

export type TaskSubSection = {
  name: string;
  tasks: Task[];
};

export type TaskDepartment = {
  name: string;
  color: string;
  progressColor: string;
  taskCount: number;
  progress: number;
  subSections: TaskSubSection[];
};

export type CreateTaskFormData = {
  taskName: string;
  department: string;
  taskType: string;
  assignTo: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
};

export const DEPARTMENTS = ["Sales", "Design", "Development", "Social Media"] as const;

export const TASK_TYPES_BY_DEPARTMENT: Record<string, string[]> = {
  Sales: ["Lead Qualification", "Proposal & Closing"],
  Design: ["Research & Moodboarding", "Wireframing", "UI Design"],
  Development: ["Frontend Development", "Backend & CMS", "QA & Launch"],
  "Social Media": ["Content Strategy", "Content Creation", "Publishing & Reporting"],
};

export const ASSIGNEES = [
  { id: "as", name: "Arjun Sindhia", initials: "AS", color: "bg-green-500" },
  { id: "rk", name: "Rajesh K.", initials: "RK", color: "bg-blue-500" },
  { id: "pd", name: "Priya D.", initials: "PD", color: "bg-purple-500" },
  { id: "av", name: "Amit V.", initials: "AV", color: "bg-orange-500" },
  { id: "sm", name: "Sneha M.", initials: "SM", color: "bg-pink-500" },
] as const;

export const STATUS_OPTIONS: TaskStatus[] = ["Open", "In Progress", "Closed", "On-Hold"];

export const PRIORITY_OPTIONS: TaskPriority[] = ["Low", "Medium", "High"];
