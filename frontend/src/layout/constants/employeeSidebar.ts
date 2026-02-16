import type { LinkToPage } from "@/utils/type";
import { BookIcon } from "../components/icons";

/** CRM Employee sidebar: Projects only (employee lands on Projects page) */
export const EMPLOYEE_SIDEBAR_ITEMS: LinkToPage[] = [
  { title: "Projects", path: "/employee/dashboard/projects", icon: BookIcon },
];
