import type { LinkToPage } from "@/utils/type";
import { BookIcon, DashboardIcon } from "../components/icons";

/** CRM Employee sidebar: Dashboard + Projects (same structure as admin area) */
export const EMPLOYEE_SIDEBAR_ITEMS: LinkToPage[] = [
  { title: "Dashboard", path: "/employee/dashboard", icon: DashboardIcon },
  { title: "Projects", path: "/employee/dashboard/projects", icon: BookIcon },
];
