"use client";

import { useAppSelector } from "@/store/hooks";
import { APP_CONSTANT } from "@/shared/constants/app";
import { useEffect, useMemo } from "react";
import { TopBarAndSideBarLayout } from "./TopBarAndSideBarLayout";
import { ADMIN_SIDEBAR_ITEMS } from "./constants/adminSidebar";
import { EMPLOYEE_SIDEBAR_ITEMS } from "./constants/employeeSidebar";
import type { LinkToPage } from "@/utils/type";

export type SidebarConfig = {
  items: Array<LinkToPage>;
  secondaryItems?: Array<LinkToPage>;
};

export function getSidebarConfig(role: string | undefined): SidebarConfig {
  switch (role) {
    case "admin":
      return { items: ADMIN_SIDEBAR_ITEMS };
    case "employee":
      return { items: EMPLOYEE_SIDEBAR_ITEMS };
    default:
      return { items: EMPLOYEE_SIDEBAR_ITEMS };
  }
}

/** Returns flat list of sidebar items (for layouts that need a single array). */
export function getSidebarItems(role: string | undefined): Array<LinkToPage> {
  const config = getSidebarConfig(role);
  return config.secondaryItems ? [...config.items, ...config.secondaryItems] : config.items;
}

export function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppSelector((s) => s.auth);

  const sidebarConfig = useMemo(
    () => getSidebarConfig(currentUser?.user?.role),
    [currentUser?.user?.role]
  );

  const userEmail = currentUser?.user?.email;

  useEffect(() => {
    document.title = APP_CONSTANT.AppClientName;
  }, []);

  const isEmployee = currentUser?.user?.role === "employee";

  return (
    <TopBarAndSideBarLayout
      sidebarItems={sidebarConfig.items}
      sidebarSecondaryItems={sidebarConfig.secondaryItems}
      hideSidebar={isEmployee}
      userEmail={userEmail}
    >
      {children}
    </TopBarAndSideBarLayout>
  );
}
