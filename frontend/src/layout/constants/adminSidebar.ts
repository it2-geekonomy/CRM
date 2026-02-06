import type { LinkToPage } from "@/utils/type";
import { BookIcon, DashboardIcon, UsersIcon } from "../components/icons";

export const ADMIN_SIDEBAR_ITEMS: LinkToPage[] = [
  { title: "Dashboard", path: "/admin/dashboard", icon: DashboardIcon },
  { title: "Courses", path: "/admin/courses", icon: BookIcon },
  { title: "Users", path: "/admin/users", icon: UsersIcon },
];
