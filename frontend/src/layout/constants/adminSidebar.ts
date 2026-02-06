import type { LinkToPage } from "@/utils/type";
import { BuildingIcon, DashboardIcon, UserCircleIcon, UsersIcon } from "../components/icons";

/** CRM Admin sidebar: Dashboard, Departments, Employees, Users */
export const ADMIN_SIDEBAR_ITEMS: LinkToPage[] = [
  { title: "Dashboard", path: "/admin/dashboard", icon: DashboardIcon },
  { title: "Departments", path: "/admin/departments", icon: BuildingIcon },
  { title: "Employees", path: "/admin/employees", icon: UsersIcon },
  { title: "Users", path: "/admin/users", icon: UserCircleIcon },
];
