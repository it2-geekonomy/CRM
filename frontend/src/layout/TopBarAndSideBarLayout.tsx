"use client";

import type { LinkToPage } from "@/utils/type";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMemo, useState } from "react";
import { TopBar } from "./components/TopBar";
import { SideBar } from "./components/SideBar";
import {
  SIDE_BAR_WIDTH,
  TOP_BAR_DESKTOP_HEIGHT,
  TOP_BAR_MOBILE_HEIGHT,
} from "./config";

interface TopBarAndSideBarLayoutProps {
  sidebarItems: Array<LinkToPage>;
  /** Optional second group (e.g. student: Courses top, My Courses bottom) */
  sidebarSecondaryItems?: Array<LinkToPage>;
  /** When true, only the top bar is shown (e.g. for Employee role). */
  hideSidebar?: boolean;
  userEmail?: string;
  children: React.ReactNode;
}

export function TopBarAndSideBarLayout({
  sidebarItems,
  sidebarSecondaryItems,
  hideSidebar = false,
  userEmail,
  children,
}: TopBarAndSideBarLayoutProps) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const isMobile = useMediaQuery("(max-width: 900px)");

  const sidebarVariant = isMobile ? "temporary" : "persistent";
  const sidebarOpen = !hideSidebar && (isMobile ? sidebarVisible : true);

  const mainPaddingTop = isMobile ? TOP_BAR_MOBILE_HEIGHT : TOP_BAR_DESKTOP_HEIGHT;
  const mainPaddingLeft =
    !hideSidebar && !isMobile && sidebarOpen ? SIDE_BAR_WIDTH : "0";

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: mainPaddingTop }}>
      <TopBar
        onSidebarToggle={hideSidebar ? undefined : () => setSidebarVisible(true)}
        showSidebarToggle={!hideSidebar}
        userEmail={userEmail}
      />

      {/* Mobile: overlay backdrop (only when sidebar is used) */}
      {!hideSidebar && isMobile && sidebarVisible && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          style={{ marginTop: TOP_BAR_MOBILE_HEIGHT }}
          aria-hidden
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Sidebar: only when not hidden (e.g. Admin has sidebar, Employee does not) */}
      {!hideSidebar && (
        <div
          className={`fixed left-0 top-0 z-20 h-full flex flex-col bg-[#242D3D] transition-transform duration-200 ease-out ${
            isMobile ? (sidebarVisible ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
          }`}
          style={{
            width: SIDE_BAR_WIDTH,
            paddingTop: isMobile ? TOP_BAR_MOBILE_HEIGHT : TOP_BAR_DESKTOP_HEIGHT,
          }}
        >
          <SideBar
            items={sidebarItems}
            secondaryItems={sidebarSecondaryItems}
            variant={sidebarVariant}
            onClose={() => setSidebarVisible(false)}
          />
        </div>
      )}

      {/* Main content */}
      <main
        className="flex-1 flex flex-col"
        style={{ paddingLeft: mainPaddingLeft }}
      >
        {children}
      </main>
    </div>
  );
}
