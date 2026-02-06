import type { LinkToPage } from "@/utils/type";
import { BookIcon, CertificateIcon, ChartBarIcon, DashboardIcon, UserCircleIcon } from "../components/icons";

/** Top section: Dashboard + browse Courses */
export const STUDENT_SIDEBAR_TOP: LinkToPage[] = [
  { title: "Dashboard", path: "/student/dashboard", icon: DashboardIcon },
  { title: "Courses", path: "/student/courses", icon: BookIcon },
];

/** Bottom section: My Courses + Progress, Certificates, Profile */
export const STUDENT_SIDEBAR_BOTTOM: LinkToPage[] = [
  { title: "My Courses", path: "/student/my-courses", icon: BookIcon },
  { title: "Progress", path: "/student/progress", icon: ChartBarIcon },
  { title: "Certificates", path: "/student/certificates", icon: CertificateIcon },
  { title: "Profile", path: "/student/profile", icon: UserCircleIcon },
];

/** Single list (for layouts that don't support two sections) */
export const STUDENT_SIDEBAR_ITEMS: LinkToPage[] = [
  ...STUDENT_SIDEBAR_TOP,
  ...STUDENT_SIDEBAR_BOTTOM,
];
