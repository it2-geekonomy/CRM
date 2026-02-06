"use client";

import type { LinkToPage } from "@/utils/type";
import { SideBarNavItem } from "./SideBarNavItem";

interface SideBarNavListProps {
  items: Array<LinkToPage>;
  onClick?: () => void;
}

export function SideBarNavList({ items, onClick }: SideBarNavListProps) {
  return (
    <nav className="flex flex-col">
      {items.map(({ icon, path, title, subtitle, children }) => (
        <SideBarNavItem
          key={`${title}-${path ?? ""}`}
          icon={icon}
          path={path}
          title={title}
          subtitle={subtitle}
          children={children}
          onClick={onClick}
        />
      ))}
    </nav>
  );
}
