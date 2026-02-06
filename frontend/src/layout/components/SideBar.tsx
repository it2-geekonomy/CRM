"use client";

import type { LinkToPage } from "@/utils/type";
import { SideBarNavList } from "./SideBarNavList";
import { SIDE_BAR_WIDTH } from "../config";

export interface SideBarProps {
  items: Array<LinkToPage>;
  /** Optional second group (e.g. student: Courses top, My Courses bottom) */
  secondaryItems?: Array<LinkToPage>;
  onClose?: () => void;
  variant?: "temporary" | "persistent";
}

export function SideBar({ items, secondaryItems, onClose, variant = "persistent" }: SideBarProps) {
  const handleAfterLinkClick = () => {
    if (variant === "temporary" && onClose) onClose();
  };

  return (
    <aside
      className="flex flex-col h-full bg-[#242D3D] flex-shrink-0"
      style={{ width: SIDE_BAR_WIDTH }}
    >
      <div className="py-6 px-6">
        <a href="/" className="text-white font-semibold text-lg">
          Course Portal
        </a>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        <SideBarNavList items={items} onClick={handleAfterLinkClick} />
        {secondaryItems && secondaryItems.length > 0 && (
          <>
            <div className="my-3 mx-4 border-t border-white/20" aria-hidden />
            <SideBarNavList items={secondaryItems} onClick={handleAfterLinkClick} />
          </>
        )}
      </div>
      <footer className="py-4 text-center text-white/80 text-sm">
        Copyright © {new Date().getFullYear()} Course Portal
      </footer>
    </aside>
  );
}
