"use client";

import type { TeamMember } from "../configuration/page";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "teamMembers";

const DUMMY_MEMBER: TeamMember = {
  id: 0,
  firstName: "Rajesh",
  lastName: "Kumar",
  email: "rajesh.kumar@geekonomy.com",
  phone: "+91 98765 43210",
  employeeId: "EMP-001",
  dateOfJoining: "2024-01-15",
  department: "Design",
  jobTitle: "Lead Designer",
  roleType: "Full-time",
  reportingManager: "Arjun Sindhia",
  experienceLevel: "Senior (5–10 years)",
  location: "Mumbai Office",
  status: "Active",
};

export default function TeamMemberDetailsPage() {
  const params = useParams();
  const idParam = params?.id;
  const idStr = Array.isArray(idParam) ? idParam?.[0] : idParam;
  const idFromUrl = idStr != null && idStr !== "" ? Number(idStr) : null;
  const resolvedId = idFromUrl != null && !Number.isNaN(idFromUrl) ? idFromUrl : 1;
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const members: TeamMember[] = raw ? JSON.parse(raw) : [];
      const found = members.find((m) => Number(m.id) === Number(resolvedId));
      setMember(found ?? { ...DUMMY_MEMBER, id: resolvedId });
    } catch {
      setMember({ ...DUMMY_MEMBER, id: resolvedId });
    } finally {
      setLoaded(true);
    }
  }, [resolvedId]);

  if (!loaded) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading team member…</p>
        </div>
      </div>
    );
  }

  const display = member ?? { ...DUMMY_MEMBER, id: resolvedId };
  const initials = [display.firstName, display.lastName]
    .map((s) => (s || "").charAt(0).toUpperCase())
    .join("") || "?";

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="mb-6">
          <Link
            href="/admin/dashboard/team"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Team
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Team Member Details</h1>
          <p className="text-gray-500 mt-2">
            View and manage team member information, role, and department
          </p>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            <span
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                display.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {display.status}
            </span>
          </div>
          <div className="mt-6 flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-2xl shrink-0">
              {initials}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-w-0">
              <div>
                <p className="text-sm font-medium text-gray-500">First Name</p>
                <p className="mt-1 text-gray-900">{display.firstName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Name</p>
                <p className="mt-1 text-gray-900">{display.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="mt-1 text-gray-900">{display.email || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <p className="mt-1 text-gray-900">{display.phone || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Employee ID</p>
                <p className="mt-1 text-gray-900">{display.employeeId || "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">Auto-generated if left blank</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Joining</p>
                <p className="mt-1 text-gray-900">{display.dateOfJoining || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role & Department */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="pb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Role & Department</h2>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="mt-1 text-gray-900">{display.department || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Job Title</p>
              <p className="mt-1 text-gray-900">{display.jobTitle || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Role Type</p>
              <p className="mt-1 text-gray-900">{display.roleType || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reporting Manager</p>
              <p className="mt-1 text-gray-900">{display.reportingManager || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Experience Level</p>
              <p className="mt-1 text-gray-900">{display.experienceLevel || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="mt-1 text-gray-900">{display.location || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
