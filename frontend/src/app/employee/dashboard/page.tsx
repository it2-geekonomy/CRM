"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Employee has no dashboard; redirect to Projects page. */
export default function EmployeeDashboardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/employee/dashboard/projects");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[40vh] p-8">
      <p className="text-gray-500">Redirecting to projects…</p>
    </div>
  );
}
