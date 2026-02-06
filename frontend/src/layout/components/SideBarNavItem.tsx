"use client";

import type { LinkToPage } from "@/utils/type";
import { usePathname, useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";

interface SideBarNavItemProps extends LinkToPage {
  onClick?: () => void;
  children?: Array<LinkToPage>;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function SideBarNavItem({
  icon: Icon,
  path,
  title,
  subtitle,
  children = [],
  onClick,
}: SideBarNavItemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hasChildren = children.length > 0;
  const isSelected = pathname === path;
  const isChildSelected = children.some((c) => pathname === c.path);

  const active = isSelected || isChildSelected;
  const iconColor = active ? "#FF6B00" : "#687B9D";
  const bg = active ? "bg-[#45536C]" : "bg-transparent";
  const hover = "hover:bg-[#354053]";
  const text = active ? "text-white font-semibold" : "text-[#687B9D]";

  const handleToggle = (e: MouseEvent) => {
    e.stopPropagation();
    setOpen((o) => !o);
  };

  const handleClick = () => {
    if (path) router.push(path);
    onClick?.();
  };

  return (
    <>
      <button
        type="button"
        onClick={hasChildren ? handleToggle : handleClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 ${bg} ${hover} ${text} text-left`}
      >
        {Icon && (
          <span className="flex-shrink-0 [&>svg]:w-5 [&>svg]:h-5" style={{ color: iconColor }}>
            <Icon />
          </span>
        )}
        <span className="flex-1">{title}</span>
        {subtitle && <span className="text-sm opacity-80">{subtitle}</span>}
        {hasChildren && (
          <span className="flex-shrink-0 text-white/80">
            {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </span>
        )}
      </button>
      {hasChildren && (
        <div className={`overflow-hidden ${open ? "max-h-96" : "max-h-0"}`}>
          {children.map((child) => {
            const cActive = pathname === child.path;
            const ChildIcon = child.icon;
            return (
              <button
                key={child.path ?? child.title}
                type="button"
                onClick={() => {
                  if (child.path) router.push(child.path);
                  onClick?.();
                }}
                className={`w-full flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-lg mx-2 my-1 text-left ${
                  cActive ? "bg-[#45536C] text-white font-semibold" : "text-[#687B9D] hover:bg-[#354053]"
                }`}
              >
                {ChildIcon && (
                  <span className="flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4" style={{ color: cActive ? "#FF6B00" : "#687B9D" }}>
                    <ChildIcon />
                  </span>
                )}
                <span>{child.title}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
