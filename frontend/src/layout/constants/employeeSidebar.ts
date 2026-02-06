import type { LinkToPage } from "@/utils/type";
import { DashboardIcon } from "../components/icons";

/** CRM Employee sidebar (minimal: dashboard only for now) */
export const EMPLOYEE_SIDEBAR_ITEMS: LinkToPage[] = [
  { title: "Dashboard", path: "/admin/dashboard", icon: DashboardIcon },
];
