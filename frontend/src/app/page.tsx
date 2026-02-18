"use client";

import { useIsAuthenticated } from "@/hooks/auth";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const role = useAppSelector((s) => s.auth.currentUser?.user?.role);

  // Redirect authenticated users to their dashboard by role
  useEffect(() => {
    if (!isAuthenticated) return;
    router.replace(role === "admin" ? "/admin/dashboard" : "/employee/dashboard");
  }, [isAuthenticated, role, router]);

  if (isAuthenticated) {
    return (
      <div className="p-6 md:p-8 lg:p-10 flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-500">Redirecting to dashboard…</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 md:px-8 py-16 md:py-24 lg:py-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Manage your team with{" "}
              <span className="text-[#242D3D]">CRM</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-xl">
              <span className="font-semibold text-blue-600">Admins</span> manage departments and employees.{" "}
              <span className="font-semibold text-blue-600">Employees</span> are added by admins and belong to departments.
            </p>
            <div className="mt-8">
              <Link
                href="/auth/login"
                className="inline-flex items-center px-8 py-4 rounded-xl bg-[#242D3D] text-white font-semibold text-lg hover:bg-[#1a222c] shadow-lg shadow-[#242D3D]/20 transition-all hover:shadow-xl hover:shadow-[#242D3D]/25"
              >
                Log in
              </Link>
            </div>
          </div>
          <div className="relative h-64 md:h-80 lg:h-96 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-90" />
            </div>
            <div className="absolute top-1/4 right-1/4 w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-cyan-100 to-blue-200 opacity-80" />
            <div className="absolute bottom-1/4 left-1/4 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-violet-100 to-purple-200 opacity-80" />
            <div className="relative z-10 grid grid-cols-2 gap-3 md:gap-4">
              {[
                { icon: "👤", label: "Admin" },
                { icon: "👥", label: "Employees" },
                { icon: "🏢", label: "Departments" },
                { icon: "✓", label: "Manage" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/90 backdrop-blur shadow-lg border border-gray-100/80"
                >
                  <span className="text-2xl md:text-3xl">{icon}</span>
                  <span className="text-xs md:text-sm font-medium text-gray-600 mt-1">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="px-4 md:px-8 py-16 md:py-20 bg-gray-50/80">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            Two roles
          </h2>
          <p className="mt-2 text-gray-600 text-center max-w-2xl mx-auto">
            Admins manage the system. Employees are created by admins and belong to departments.
          </p>
          <div className="mt-12 grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <span className="text-4xl">⚙️</span>
              <h3 className="mt-4 text-xl font-bold text-gray-900">Admin</h3>
              <p className="mt-2 text-gray-600">
                Create departments, add employees, and manage users. Log in to access the admin dashboard.
              </p>
              <Link
                href="/auth/login"
                className="mt-4 inline-flex items-center text-sm font-medium text-[#242D3D] hover:underline"
              >
                Log in →
              </Link>
            </div>
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <span className="text-4xl">👥</span>
              <h3 className="mt-4 text-xl font-bold text-gray-900">Employee</h3>
              <p className="mt-2 text-gray-600">
                Employees are added by admins and assigned to a department. Contact your admin for access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why / Features */}
      <section className="px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            Why CRM?
          </h2>
          <div className="mt-12 grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: "🏢", title: "Departments", desc: "Organize your team by department with clear structure." },
              { icon: "🔒", title: "Secure & controlled", desc: "Only admins create employees. You stay in control." },
              { icon: "📱", title: "Works everywhere", desc: "Use it on desktop, tablet, or phone." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <span className="text-4xl">{icon}</span>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 py-16 md:py-20 bg-[#242D3D]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Ready to get started?
          </h2>
          <p className="mt-3 text-gray-300">
            Log in to access the CRM dashboard.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-[#242D3D] font-semibold hover:bg-gray-100 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
