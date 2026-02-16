"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useGetEmployeesQuery } from "@/store/api/employeeApiSlice";
import type { Employee } from "@/store/api/employeeApiSlice";

const QUICK_FILTERS = ["All Employees", "Active", "On Leave", "By Department"];

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function AdminEmployeesPage() {
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState("All Employees");
  const { data, isLoading, isError } = useGetEmployeesQuery({
    limit: 50,
    search: search || undefined,
    sortBy: "name",
    sortOrder: "ASC",
  });

  const rawEmployees = data?.data ?? [];
  const meta = data?.meta;

  const employees = useMemo(() => {
    if (quickFilter === "Active")
      return rawEmployees.filter((e) => e.employmentStatus === "ACTIVE");
    if (quickFilter === "On Leave")
      return rawEmployees.filter((e) => e.employmentStatus === "INACTIVE" || e.employmentStatus === "ON_NOTICE");
    return rawEmployees;
  }, [rawEmployees, quickFilter]);

  const activeCount = useMemo(
    () => rawEmployees.filter((e) => e.employmentStatus === "ACTIVE").length,
    [rawEmployees]
  );
  const inactiveCount = useMemo(
    () => rawEmployees.filter((e) => e.employmentStatus !== "ACTIVE").length,
    [rawEmployees]
  );

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #22c55e;
          border-radius: 10px;
          border: 1px solid #f3f4f6;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #16a34a;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #22c55e #f3f4f6;
        }
      `}</style>
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Employees</h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-10">
          <h1 className="text-2xl font-semibold text-gray-900">Good morning</h1>
          <p className="text-gray-500 mt-1">Search across employees</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button
              type="button"
              className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 shrink-0"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {QUICK_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setQuickFilter(filter)}
                className={`px-4 py-2 rounded-xl border text-sm transition-colors ${
                  quickFilter === filter
                    ? "border-green-500 text-green-700 bg-green-50"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-8">
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Active Employees</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{activeCount}</h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">
              {meta?.total ?? 0} total
            </p>
          </div>
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Inactive / Other</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{inactiveCount}</h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">
              On leave, exited, etc.
            </p>
          </div>
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500 border-green-500">
            <p className="text-base text-gray-500">Total Employees</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{meta?.total ?? 0}</h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">All time</p>
          </div>
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Departments</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">
              {employees.length ? new Set(employees.map((e) => e.department?.name).filter(Boolean)).size : "—"}
            </h3>
            <p className="text-sm text-gray-500 mt-2">With employees</p>
          </div>
        </div>

        <div className="custom-scrollbar bg-white rounded-2xl border border-gray-200 p-6 max-h-[600px] overflow-y-auto">
          {isLoading && (
            <div className="p-8 text-center text-gray-500">Loading employees…</div>
          )}
          {isError && (
            <div className="p-8 text-center text-red-600">
              Failed to load employees. Please try again.
            </div>
          )}
          {!isLoading && !isError && employees.length === 0 && (
            <div className="p-8 text-center text-gray-500">No employees found</div>
          )}
          {!isLoading && !isError && employees.length > 0 && (
            <div className="space-y-3">
              {employees.map((employee) => (
                <EmployeeRow key={employee.id} employee={employee} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmployeeRow({ employee }: { employee: Employee }) {
  const status =
    employee.employmentStatus === "ACTIVE"
      ? "Active"
      : employee.employmentStatus === "ON_NOTICE"
        ? "On Notice"
        : employee.employmentStatus === "EXITED"
          ? "Exited"
          : employee.employmentStatus === "INACTIVE"
            ? "Inactive"
            : employee.employmentStatus;

  return (
    <Link
      href={`/admin/employees/${employee.id}`}
      className="block relative bg-white rounded-xl border border-gray-200 p-5 hover:border-green-500 transition-all group"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl group-hover:bg-green-600" />
      <div className="flex items-center justify-between gap-4 pl-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-medium text-sm shrink-0">
            {getInitials(employee.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500 mb-0.5">
              {employee.dateOfJoining ? formatDate(employee.dateOfJoining) : "—"} •{" "}
              {employee.department?.name ?? "—"}
            </p>
            <h2 className="text-base font-semibold text-gray-900 mb-1">{employee.name}</h2>
            <p className="text-sm text-gray-500">
              {employee.user?.email ?? "—"} • {employee.designation}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium ${
            employee.employmentStatus === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : employee.employmentStatus === "EXITED"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </span>
      </div>
    </Link>
  );
}
