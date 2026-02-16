"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { TeamMember } from "./configuration/page";

const STORAGE_KEY = "teamMembers";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const loadMembers = () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved: TeamMember[] = raw ? JSON.parse(raw) : [];
    setMembers(saved);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Re-load when user returns to this tab (e.g. saved in config in another tab)
  useEffect(() => {
    const onFocus = () => loadMembers();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const filtered = search.trim()
    ? members.filter(
        (m) =>
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()) ||
          m.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
          m.department.toLowerCase().includes(search.toLowerCase())
      )
    : members;

  const activeCount = members.filter((m) => m.status === "Active").length;
  const draftCount = members.filter((m) => m.status === "Draft").length;

  const getInitials = (m: TeamMember) =>
    [m.firstName, m.lastName].map((s) => (s || "").charAt(0).toUpperCase()).join("") || "?";

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Team</h2>
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard/team/configuration")}
            className="px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700"
          >
            + Add Team Member
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-10">
          <h1 className="text-2xl font-semibold text-gray-900">Good morning</h1>
          <p className="text-gray-500 mt-1">Search across team members</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name, email, role..."
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Active Members</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{activeCount}</h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">{members.length} total</p>
          </div>
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Draft</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{draftCount}</h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">Pending</p>
          </div>
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Total Team</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{members.length}</h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">Members</p>
          </div>
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Departments</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">
              {new Set(members.map((m) => m.department)).size}
            </h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">Unique</p>
          </div>
        </div>

        <div className="custom-scrollbar bg-white rounded-2xl border border-gray-200 p-6 max-h-[600px] overflow-y-auto">
          {members.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No team members yet. Add one from Team Configuration.
            </div>
          )}

          {members.length > 0 && (
            <div className="space-y-3">
              {filtered.map((member) => (
                <Link
                  key={member.id}
                  href={`/admin/dashboard/team/${member.id}`}
                  className="block relative bg-white rounded-xl border border-gray-200 p-5 hover:border-green-500 transition-all group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl group-hover:bg-green-600" />
                  <div className="flex items-center gap-4 pl-4">
                    <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                      {getInitials(member)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">
                        {member.employeeId} • Joined {member.dateOfJoining || "—"}
                      </p>
                      <h2 className="text-base font-semibold text-gray-900 mt-0.5">
                        {member.firstName} {member.lastName}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {member.jobTitle} • {member.department} • {member.location}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">{member.email}</p>
                    </div>
                    <span
                      className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium ${
                        member.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                </Link>
              ))}
              {filtered.length === 0 && (
                <div className="p-6 text-center text-gray-500">No members match your search.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
