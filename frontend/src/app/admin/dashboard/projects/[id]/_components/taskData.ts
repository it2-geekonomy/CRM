import type { Task, TaskDepartment } from "./taskTypes";
import { ASSIGNEES } from "./taskTypes";

/** Find a task by ID from departments. Replace with API call when backend is ready. */
export function getTaskById(departments: TaskDepartment[], taskId: string): Task | null {
  for (const dept of departments) {
    for (const sub of dept.subSections) {
      const found = sub.tasks.find((t) => t.id === taskId);
      if (found) return found;
    }
  }
  return null;
}

/** Maps display task type (from form) to sub-section key in data */
export const TASK_TYPE_TO_SUBSECTION: Record<string, string> = {
  "Lead Qualification": "LEAD QUALIFICATION",
  "Proposal & Closing": "PROPOSAL & CLOSING",
  "Research & Moodboarding": "RESEARCH & MOODBOARDING",
  Wireframing: "WIREFRAMING",
  "UI Design": "UI DESIGN",
  "Frontend Development": "FRONTEND DEVELOPMENT",
  "Backend & CMS": "BACKEND & CMS",
  "QA & Launch": "QA & LAUNCH",
  "Content Strategy": "CONTENT STRATEGY",
  "Content Creation": "CONTENT CREATION",
  "Publishing & Reporting": "PUBLISHING & REPORTING",
};

export const INITIAL_TASK_DEPARTMENTS: TaskDepartment[] = [
  {
    name: "Sales",
    color: "bg-pink-500",
    progressColor: "bg-green-500",
    taskCount: 8,
    progress: 62,
    subSections: [
      {
        name: "LEAD QUALIFICATION",
        tasks: [
          { id: "s1", description: "Initial discovery call with ABC Corp", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "Closed", date: "Jan 20", isComplete: true },
          { id: "s2", description: "BANT qualification checklist", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "Closed", date: "Jan 22", isComplete: true },
          { id: "s3", description: "Stakeholder mapping & decision process", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "Closed", date: "Jan 25", isComplete: true },
          { id: "s4", description: "Budget & timeline alignment", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "Closed", date: "Jan 28", isComplete: true },
        ],
      },
      {
        name: "PROPOSAL & CLOSING",
        tasks: [
          { id: "s5", description: "Draft proposal document", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "Closed", date: "Feb 1", isComplete: true },
          { id: "s6", description: "Proposal presentation to client", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "Closed", date: "Feb 5", isComplete: true },
          { id: "s7", description: "Negotiate terms & revisions", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "Closed", date: "Feb 6", isComplete: true },
          { id: "s8", description: "Collect signed contract & advance payment", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "In Progress", date: "Feb 7", isComplete: false },
        ],
      },
    ],
  },
  {
    name: "Design",
    color: "bg-purple-400",
    progressColor: "bg-blue-500",
    taskCount: 12,
    progress: 75,
    subSections: [
      {
        name: "RESEARCH & MOODBOARDING",
        tasks: [
          { id: "d1", description: "Competitor website analysis (5 competitors)", assignee: { initials: "RK", name: "Rajesh K." }, assigneeColor: "bg-blue-500", status: "Closed", date: "Jan 22", isComplete: true },
          { id: "d2", description: "Moodboard creation - 3 style directions", assignee: { initials: "RK", name: "Rajesh K." }, assigneeColor: "bg-blue-500", status: "Closed", date: "Jan 26", isComplete: true },
          { id: "d3", description: "Typography & colour palette selection", assignee: { initials: "RK", name: "Rajesh K." }, assigneeColor: "bg-blue-500", status: "Closed", date: "Jan 28", isComplete: true },
          { id: "d4", description: "Client sign-off on design direction", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "Closed", date: "Jan 30", isComplete: true },
        ],
      },
      {
        name: "WIREFRAMING",
        tasks: [
          { id: "d5", description: "Homepage wireframe - desktop & mobile", assignee: { initials: "RK", name: "Rajesh K." }, assigneeColor: "bg-blue-500", status: "Closed", date: "Feb 3", isComplete: true },
          { id: "d6", description: "Inner pages wireframe (About, Services, Blog)", assignee: { initials: "RK", name: "Rajesh K." }, assigneeColor: "bg-blue-500", status: "Closed", date: "Feb 7", isComplete: true },
          { id: "d7", description: "Contact & Careers page wireframe", assignee: { initials: "RK", name: "Rajesh K." }, assigneeColor: "bg-blue-500", status: "Closed", date: "Feb 10", isComplete: true },
          { id: "d8", description: "Client wireframe review & sign-off", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "Closed", date: "Feb 14", isComplete: true },
        ],
      },
      {
        name: "UI DESIGN",
        tasks: [
          { id: "d9", description: "Homepage UI - all breakpoints (Figma)", assignee: { initials: "RK", name: "Rajesh K." }, assigneeColor: "bg-blue-500", status: "Closed", date: "Feb 21", isComplete: true },
          { id: "d10", description: "Inner pages UI design (About, Services, Blog)", assignee: { initials: "RK", name: "Rajesh K." }, assigneeColor: "bg-blue-500", status: "In Progress", date: "Mar 1", isComplete: false },
          { id: "d11", description: "Design system & reusable component library", assignee: { initials: "RK", name: "Rajesh K." }, assigneeColor: "bg-blue-500", status: "Open", date: "Mar 8", isComplete: false },
        ],
      },
    ],
  },
  {
    name: "Development",
    color: "bg-green-400",
    progressColor: "bg-purple-500",
    taskCount: 12,
    progress: 28,
    subSections: [
      {
        name: "FRONTEND DEVELOPMENT",
        tasks: [
          { id: "dv1", description: "Environment & repo setup, CI/CD pipeline", assignee: { initials: "PD", name: "Priya D." }, assigneeColor: "bg-purple-500", status: "Closed", date: "Feb 17", isComplete: true },
          { id: "dv2", description: "Homepage build & responsive layout", assignee: { initials: "PD", name: "Priya D." }, assigneeColor: "bg-purple-500", status: "Closed", date: "Mar 5", isComplete: true },
          { id: "dv3", description: "Inner pages build & full responsive layout", assignee: { initials: "PD", name: "Priya D." }, assigneeColor: "bg-purple-500", status: "Open", date: "Mar 20", isComplete: false },
          { id: "dv4", description: "CMS integration & content model", assignee: { initials: "PD", name: "Priya D." }, assigneeColor: "bg-purple-500", status: "Open", date: "Apr 5", isComplete: false },
        ],
      },
      {
        name: "BACKEND & CMS",
        tasks: [
          { id: "dv5", description: "API design & database schema", assignee: { initials: "AV", name: "Amit V." }, assigneeColor: "bg-orange-500", status: "Closed", date: "Feb 20", isComplete: true },
          { id: "dv6", description: "Auth & user management", assignee: { initials: "AV", name: "Amit V." }, assigneeColor: "bg-orange-500", status: "On-Hold", date: "Mar 15", isComplete: false },
          { id: "dv7", description: "Content API & webhooks", assignee: { initials: "AV", name: "Amit V." }, assigneeColor: "bg-orange-500", status: "Open", date: "Mar 25", isComplete: false },
          { id: "dv8", description: "Admin dashboard & workflows", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "Open", date: "Apr 15", isComplete: false },
        ],
      },
      {
        name: "QA & LAUNCH",
        tasks: [
          { id: "dv9", description: "Cross-browser & device testing", assignee: { initials: "PD", name: "Priya D." }, assigneeColor: "bg-purple-500", status: "Open", date: "Apr 20", isComplete: false },
          { id: "dv10", description: "Performance audit & optimization", assignee: { initials: "AV", name: "Amit V." }, assigneeColor: "bg-orange-500", status: "Open", date: "Apr 25", isComplete: false },
          { id: "dv11", description: "Staging deploy & UAT", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "Open", date: "May 5", isComplete: false },
          { id: "dv12", description: "Production launch & DNS cutover", assignee: { initials: "AS", name: "Arjun S." }, assigneeColor: "bg-green-500", status: "Open", date: "May 15", isComplete: false },
        ],
      },
    ],
  },
  {
    name: "Social Media",
    color: "bg-orange-400",
    progressColor: "bg-orange-500",
    taskCount: 12,
    progress: 12,
    subSections: [
      {
        name: "CONTENT STRATEGY",
        tasks: [
          { id: "sm1", description: "Audit existing social media presence & analytics", assignee: { initials: "SM", name: "Sneha M." }, assigneeColor: "bg-pink-500", status: "Closed", date: "Feb 5", isComplete: true },
          { id: "sm2", description: "Develop 3-month content calendar (Mar-May)", assignee: { initials: "SM", name: "Sneha M." }, assigneeColor: "bg-pink-500", status: "In Progress", date: "Feb 14", isComplete: false },
          { id: "sm3", description: "Define brand voice & tone guidelines for social", assignee: { initials: "SM", name: "Sneha M." }, assigneeColor: "bg-pink-500", status: "Open", date: "Feb 18", isComplete: false },
          { id: "sm4", description: "Platform strategy per channel (IG, LI, X, FB)", assignee: { initials: "SM", name: "Sneha M." }, assigneeColor: "bg-pink-500", status: "Open", date: "Feb 21", isComplete: false },
        ],
      },
      {
        name: "CONTENT CREATION",
        tasks: [
          { id: "sm5", description: "Design 12 branded social post templates (Figma)", assignee: { initials: "SM", name: "Sneha M." }, assigneeColor: "bg-pink-500", status: "Open", date: "Feb 25", isComplete: false },
          { id: "sm6", description: "Write copy for March launch campaign (10 posts)", assignee: { initials: "SM", name: "Sneha M." }, assigneeColor: "bg-pink-500", status: "Open", date: "Mar 1", isComplete: false },
          { id: "sm7", description: "Source / shoot 20 brand photography assets", assignee: { initials: "SM", name: "Sneha M." }, assigneeColor: "bg-pink-500", status: "Open", date: "Mar 8", isComplete: false },
          { id: "sm8", description: "Create 3 short-form video reels for launch week", assignee: { initials: "SM", name: "Sneha M." }, assigneeColor: "bg-pink-500", status: "Open", date: "Apr 28", isComplete: false },
        ],
      },
      {
        name: "PUBLISHING & REPORTING",
        tasks: [
          { id: "sm9", description: "Schedule all launch-week posts via Buffer/Hootsuite", assignee: { initials: "SM", name: "Sneha M." }, assigneeColor: "bg-pink-500", status: "Open", date: "May 10", isComplete: false },
          { id: "sm10", description: "Monitor & respond to comments on launch day", assignee: { initials: "SM", name: "Sneha M." }, assigneeColor: "bg-pink-500", status: "Open", date: "May 15", isComplete: false },
          { id: "sm11", description: "Post-launch analytics report - Week 1", assignee: { initials: "SM", name: "Sneha M." }, assigneeColor: "bg-pink-500", status: "Open", date: "May 22", isComplete: false },
          { id: "sm12", description: "30-day performance review & recommendations deck", assignee: { initials: "SM", name: "Sneha M." }, assigneeColor: "bg-pink-500", status: "Open", date: "Jun 15", isComplete: false },
        ],
      },
    ],
  },
];

function formatDateForDisplay(dateStr: string): string {
  const parts = dateStr.split(/[/-]/);
  if (parts.length === 3) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let m: number;
    let d: number;
    if (parts[0].length === 4) {
      m = parseInt(parts[1], 10);
      d = parseInt(parts[2], 10);
    } else {
      m = parseInt(parts[0], 10);
      d = parseInt(parts[1], 10);
    }
    if (m >= 1 && m <= 12) return `${months[m - 1]} ${d}`;
  }
  return dateStr;
}

let taskIdCounter = 100;

/** Add a new task to departments. Returns { departments, newTaskId }. */
export function addTaskToDepartments(
  departments: TaskDepartment[],
  formData: { taskName: string; department: string; taskType: string; assignTo: string; dueDate: string; status: string }
): { departments: TaskDepartment[]; newTaskId: string } {
  const subSectionKey = TASK_TYPE_TO_SUBSECTION[formData.taskType] ?? formData.taskType.toUpperCase();
  const assignee = ASSIGNEES.find((a) => a.name === formData.assignTo || a.id === formData.assignTo);
  const assigneeInfo = assignee
    ? { initials: assignee.initials, name: assignee.name }
    : { initials: "?", name: formData.assignTo };
  const assigneeColor = assignee?.color ?? "bg-gray-500";

  const newTask: Task = {
    id: `new-${taskIdCounter++}`,
    description: formData.taskName,
    assignee: assigneeInfo,
    assigneeColor,
    status: formData.status as Task["status"],
    date: formatDateForDisplay(formData.dueDate),
    isComplete: formData.status === "Closed",
  };

  const result = departments.map((dept) => {
    if (dept.name !== formData.department) return dept;
    const subFound = dept.subSections.some((s) => s.name === subSectionKey);
    const updatedSubSections = dept.subSections.map((sub) => {
      if (sub.name !== subSectionKey) return sub;
      return { ...sub, tasks: [...sub.tasks, newTask] };
    });
    const finalSubSections = subFound
      ? updatedSubSections
      : dept.subSections.length > 0
        ? [{ ...dept.subSections[0], tasks: [...dept.subSections[0].tasks, newTask] }, ...dept.subSections.slice(1)]
        : dept.subSections;
    return { ...dept, subSections: finalSubSections, taskCount: dept.taskCount + 1 };
  });

  return { departments: result, newTaskId: newTask.id };
}
