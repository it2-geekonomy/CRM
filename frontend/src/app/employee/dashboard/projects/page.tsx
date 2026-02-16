"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type Project = {
  id: number;
  projectName: string;
  projectCode?: string;
  client: string;
  projectType: string;
  description?: string;
  status: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  hourlyRate: string;
};

const QUICK_FILTERS = [
  "My Active Projects",
  "Completed",
  "Upcoming Projects",
  "Draft",
];

const todayStr = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

export default function EmployeeProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [quickFilter, setQuickFilter] = useState<string>("My Active Projects");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("projects");
    const savedProjects: Project[] = JSON.parse(raw ?? "[]");
    setProjects(savedProjects);
  }, []);

  const activeCount = projects.filter((p) => p.status === "Active").length;
  const draftCount = projects.filter((p) => p.status === "Draft").length;
  const upcomingCount = projects.filter((p) => p.startDate > todayStr()).length;

  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.projectName.toLowerCase().includes(q) ||
          (p.client || "").toLowerCase().includes(q) ||
          (p.projectCode || "").toLowerCase().includes(q)
      );
    }
    switch (quickFilter) {
      case "My Active Projects":
        list = list.filter((p) => p.status === "Active");
        break;
      case "Draft":
        list = list.filter((p) => p.status === "Draft");
        break;
      case "Upcoming Projects":
        list = list.filter((p) => p.startDate > todayStr());
        break;
      case "Completed":
        list = list.filter((p) => p.status === "Completed");
        break;
      default:
        break;
    }
    return list;
  }, [projects, quickFilter, searchQuery]);

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #69AE44; border-radius: 10px; border: 1px solid #f3f4f6; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #5a9a3a; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #69AE44 #f3f4f6; }
      `}</style>
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-10">
          <h1 className="text-2xl font-semibold text-gray-900">Good morning</h1>
          <p className="text-gray-500 mt-1">Search across projects</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-[#69AE44]/30 bg-[#69AE44]/5 focus:ring-2 focus:ring-[#69AE44] outline-none"
            />
            <button type="button" className="px-6 py-3 rounded-xl bg-[#69AE44] text-white hover:bg-[#5a9a3a] shrink-0">
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
                    ? "border-[#69AE44] text-[#69AE44] bg-[#69AE44]/10"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-8">
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-[#69AE44]">
            <p className="text-base text-gray-500">Active Projects</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{activeCount}</h3>
            <p className="text-sm text-gray-500 mt-2">{projects.length} total</p>
          </div>
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-[#69AE44]">
            <p className="text-base text-gray-500">Draft Projects</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{draftCount}</h3>
            <p className="text-sm text-gray-500 mt-2">Pending setup</p>
          </div>
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-[#69AE44]">
            <p className="text-base text-gray-500">Upcoming</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{upcomingCount}</h3>
            <p className="text-sm text-gray-500 mt-2">Starting later</p>
          </div>
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-[#69AE44]">
            <p className="text-base text-gray-500">Total Projects</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{projects.length}</h3>
            <p className="text-sm text-gray-500 mt-2">All time</p>
          </div>
        </div>

        <div className="custom-scrollbar bg-white rounded-2xl border border-gray-200 p-6 max-h-[600px] overflow-y-auto">
          {filteredProjects.length === 0 && (
            <div className="p-8 text-center text-gray-500">No projects match your filters</div>
          )}
          {filteredProjects.length > 0 && (
            <div className="space-y-3">
              {filteredProjects.map((project, index) => (
                <Link
                  key={project.id ?? index}
                  href={`/employee/dashboard/projects/${project.id}`}
                  className="block relative bg-white rounded-xl border border-gray-200 p-5 hover:border-[#69AE44] transition-all group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#69AE44] rounded-l-xl group-hover:bg-[#5a9a3a]" />
                  <div className="flex items-start justify-between gap-4 pl-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500 mb-1">{project.startDate} - {project.endDate}</p>
                      <h2 className="text-base font-semibold text-gray-900 mb-1.5">{project.projectName}</h2>
                      <p className="text-sm text-gray-500">{project.projectCode || "—"} • {project.client} • {project.projectType}</p>
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium ${project.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {project.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
