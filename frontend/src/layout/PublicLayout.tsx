"use client";

import { APP_CONSTANT } from "@/shared/constants/app";
import { useEffect } from "react";
import Link from "next/link";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.title = APP_CONSTANT.AppClientName;
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-8 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <Link href="/" className="font-bold text-xl text-gray-900 tracking-tight">
          {APP_CONSTANT.AppClientName}
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="px-5 py-2.5 rounded-lg bg-[#242D3D] text-white font-medium hover:bg-[#1a222c] shadow-sm transition-colors"
          >
            Join for free
          </Link>
        </nav>
      </header>
      <div className="min-h-[calc(100vh-4rem)]">
        {children}
      </div>
    </>
  );
}
