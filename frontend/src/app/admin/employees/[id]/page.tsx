"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetEmployeeQuery } from "@/store/api/employeeApiSlice";

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
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return dateStr;
  }
}

export default function AdminEmployeeDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { data: employee, isLoading, isError } = useGetEmployeeQuery(id, {
    skip: !id,
  });

  if (!id) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid employee ID</p>
          <Link href="/admin/employees" className="mt-4 inline-block text-green-600 hover:underline">
            ← Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading employee…</p>
        </div>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load employee or not found.</p>
          <Link href="/admin/employees" className="mt-4 inline-block text-green-600 hover:underline">
            ← Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel =
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
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="mb-6">
          <Link
            href="/admin/employees"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Employees
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center font-medium text-xl">
              {getInitials(employee.name)}
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{employee.name}</h1>
              <p className="text-gray-500 mt-1">{employee.designation}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-lg text-sm font-medium ${
                  employee.employmentStatus === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : employee.employmentStatus === "EXITED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 pb-4 border-b">
            Basic Information
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Employee ID</p>
              <p className="mt-1 text-gray-900 font-mono text-sm">{employee.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="mt-1 text-gray-900">{employee.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-gray-900">{employee.user?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Designation</p>
              <p className="mt-1 text-gray-900">{employee.designation}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="mt-1 text-gray-900">{employee.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Alternate Phone</p>
              <p className="mt-1 text-gray-900">{employee.alternatePhone ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="mt-1 text-gray-900">{employee.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="mt-1 text-gray-900">{employee.isActive ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 pb-4 border-b">
            Employment Details
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="mt-1 text-gray-900">
                {employee.department?.name ?? "—"}
                {employee.department?.code && (
                  <span className="text-gray-500 ml-1">({employee.department.code})</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Employment Type</p>
              <p className="mt-1 text-gray-900">{employee.employmentType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Employment Status</p>
              <p className="mt-1 text-gray-900">{employee.employmentStatus}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Joining</p>
              <p className="mt-1 text-gray-900">{formatDate(employee.dateOfJoining)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Exit</p>
              <p className="mt-1 text-gray-900">
                {employee.dateOfExit ? formatDate(employee.dateOfExit) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* System / Audit */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 pb-4 border-b">
            Record Info
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="mt-1 text-gray-900 text-sm">
                {formatDateTime(employee.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p className="mt-1 text-gray-900 text-sm">
                {formatDateTime(employee.updatedAt)}
              </p>
            </div>
            {employee.user?.id && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">User ID (login)</p>
                <p className="mt-1 text-gray-900 font-mono text-sm">{employee.user.id}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
