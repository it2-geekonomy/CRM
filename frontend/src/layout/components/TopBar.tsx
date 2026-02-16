"use client";

import { useAppDispatch } from "@/store/hooks";
import { logoutUser } from "@/store/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState, type MouseEvent } from "react";
import { MenuIcon, UserCircleIcon } from "./icons";

interface TopBarProps {
  onSidebarToggle?: () => void;
  /** When false, the sidebar menu button is hidden (e.g. when layout has no sidebar). */
  showSidebarToggle?: boolean;
  userEmail?: string;
}

export function TopBar({ onSidebarToggle, showSidebarToggle = true, userEmail }: TopBarProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const handleLogout = (e: MouseEvent) => {
    e.preventDefault();
    dispatch(logoutUser());
    setOpen(false);
    router.push("/auth/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 md:h-16 flex items-center justify-between px-4 bg-[#242D3D] text-white">
      {showSidebarToggle ? (
        <button
          type="button"
          onClick={onSidebarToggle}
          className="p-2 -ml-2 rounded-md hover:bg-white/10 text-white"
          aria-label="Toggle menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      ) : (
        <div className="w-10" />
      )}

      <div className="flex-1" />

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10 text-white"
          aria-label="Profile menu"
        >
          <UserCircleIcon className="w-8 h-8 text-white/90" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 py-1 text-gray-900 z-50">
            {userEmail && (
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium truncate">{userEmail}</p>
              </div>
            )}
            <button
              type="button"
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => { setOpen(false); /* TODO: /profile */ }}
            >
              Account
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => { setOpen(false); /* TODO: /settings */ }}
            >
              Settings
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Help
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
