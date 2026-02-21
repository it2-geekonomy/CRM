"use client";

import type { LinkToPage } from "@/utils/type";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMemo, useState, useEffect } from "react";
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
  /** When false, sidebar is hidden (e.g. for employee role). Default true. */
  showSidebar?: boolean;
  userEmail?: string;
  children: React.ReactNode;
}

export function TopBarAndSideBarLayout({
  sidebarItems,
  sidebarSecondaryItems,
  showSidebar = true,
  userEmail,
  children,
}: TopBarAndSideBarLayoutProps) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 900px)");

  // Prevent hydration mismatch by only using media query after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use default desktop values during SSR to match initial client render
  const effectiveIsMobile = isMounted ? isMobile : false;
  const sidebarVariant = effectiveIsMobile ? "temporary" : "persistent";
  const sidebarOpen = showSidebar && (effectiveIsMobile ? sidebarVisible : true);

  const mainPaddingTop = effectiveIsMobile ? TOP_BAR_MOBILE_HEIGHT : TOP_BAR_DESKTOP_HEIGHT;
  const mainPaddingLeft =
    showSidebar && !effectiveIsMobile && sidebarOpen ? SIDE_BAR_WIDTH : "0";

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: mainPaddingTop }}>
      <TopBar
        onSidebarToggle={() => setSidebarVisible(true)}
        showSidebarToggle={showSidebar}
        userEmail={userEmail}
      />

      {/* Mobile: overlay backdrop (only when sidebar is shown) */}
      {showSidebar && effectiveIsMobile && sidebarVisible && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          style={{ marginTop: TOP_BAR_MOBILE_HEIGHT }}
          aria-hidden
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Sidebar: only render when showSidebar is true */}
      {showSidebar && (
        <div
          className={`fixed left-0 top-0 z-20 h-full flex flex-col bg-[#242D3D] transition-transform duration-200 ease-out ${
            effectiveIsMobile ? (sidebarVisible ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
          }`}
          style={{
            width: SIDE_BAR_WIDTH,
            paddingTop: effectiveIsMobile ? TOP_BAR_MOBILE_HEIGHT : TOP_BAR_DESKTOP_HEIGHT,
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
