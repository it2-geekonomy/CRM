import type { LinkToPage } from "@/utils/type";
import { BuildingIcon, BriefcaseIcon, CogIcon, DashboardIcon, UsersIcon } from "../components/icons";

/** CRM Admin sidebar: Dashboard, Configuration (with Departments), Employees, Clients */
export const ADMIN_SIDEBAR_ITEMS: LinkToPage[] = [
  { title: "Dashboard", path: "/admin/dashboard", icon: DashboardIcon },
  { title: "Clients", path: "/admin/dashboard/clients", icon: BriefcaseIcon },
  { 
    title: "Configuration", 
    icon: CogIcon,
    children: [
      { title: "Departments", path: "/admin/departments", icon: BuildingIcon },
    ],
  },
  { title: "Employees", path: "/admin/employees", icon: UsersIcon },
];
