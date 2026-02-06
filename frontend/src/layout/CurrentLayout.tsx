"use client";

import { useAppSelector } from "@/store/hooks";
import { useIsAuthenticated } from "@/hooks/auth";
import { PrivateLayout } from "./PrivateLayout";
import { PublicLayout } from "./PublicLayout";

export function CurrentLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const { currentUser, profileId } = useAppSelector((s) => s.auth);
  const role = currentUser?.user?.role;

  // Sidebar only when: logged in AND (admin OR has profile id for student/teacher)
  const showSidebar = isAuthenticated && (role === "admin" || !!profileId);

  if (!showSidebar) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  return <PrivateLayout>{children}</PrivateLayout>;
}
