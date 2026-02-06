"use client";

import { useAppSelector } from "@/store/hooks";
import { useIsAuthenticated } from "@/hooks/auth";
import { PrivateLayout } from "./PrivateLayout";
import { PublicLayout } from "./PublicLayout";

export function CurrentLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const { currentUser } = useAppSelector((s) => s.auth);
  const role = currentUser?.user?.role;

  // Sidebar when logged in as admin or employee (CRM: no profile gate)
  const showSidebar = isAuthenticated && (role === "admin" || role === "employee");

  if (!showSidebar) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  return <PrivateLayout>{children}</PrivateLayout>;
}
