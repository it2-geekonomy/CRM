"use client";

import { useAppSelector } from "@/store/hooks";
import { APP_CONSTANT } from "@/shared/constants/app";
import { useEffect, useMemo } from "react";
import { TopBarAndSideBarLayout } from "./TopBarAndSideBarLayout";
import { ADMIN_SIDEBAR_ITEMS } from "./constants/adminSidebar";
import { TEACHER_SIDEBAR_ITEMS } from "./constants/teacherSidebar";
import { STUDENT_SIDEBAR_TOP, STUDENT_SIDEBAR_BOTTOM } from "./constants/studentSidebar";
import type { LinkToPage } from "@/utils/type";

export type SidebarConfig = {
  items: Array<LinkToPage>;
  secondaryItems?: Array<LinkToPage>;
};

export function getSidebarConfig(role: string | undefined): SidebarConfig {
  switch (role) {
    case "admin":
      return { items: ADMIN_SIDEBAR_ITEMS };
    case "teacher":
      return { items: TEACHER_SIDEBAR_ITEMS };
    case "student":
      return { items: STUDENT_SIDEBAR_TOP, secondaryItems: STUDENT_SIDEBAR_BOTTOM };
    default:
      return { items: STUDENT_SIDEBAR_TOP, secondaryItems: STUDENT_SIDEBAR_BOTTOM };
  }
}

/** @deprecated Use getSidebarConfig for two-section support. Returns flat list. */
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

  return (
    <TopBarAndSideBarLayout
      sidebarItems={sidebarConfig.items}
      sidebarSecondaryItems={sidebarConfig.secondaryItems}
      userEmail={userEmail}
    >
      {children}
    </TopBarAndSideBarLayout>
  );
}
