import type { LinkToPage } from "@/utils/type";
import { BookIcon, ChartBarIcon, DashboardIcon, GraduationCapIcon, UserCircleIcon } from "../components/icons";

export const TEACHER_SIDEBAR_ITEMS: LinkToPage[] = [
  { title: "Dashboard", path: "/teacher/dashboard", icon: DashboardIcon },
  { title: "My Courses", path: "/teacher/courses", icon: BookIcon },
  { title: "Students", path: "/teacher/students", icon: GraduationCapIcon },
  { title: "Analytics", path: "/teacher/analytics", icon: ChartBarIcon },
  { title: "Profile", path: "/teacher/profile", icon: UserCircleIcon },
];
