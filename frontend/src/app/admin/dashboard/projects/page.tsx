"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetProjectsQuery,
  type ProjectApi,
  type ProjectStatus,
} from "@/store/api/projectApiSlice";

/** Local type for list display (API projectId + display fields) */
export type Project = {
  id: string;
  projectName: string;
  projectCode?: string;
  projectType: string;
  status: string;
  startDate: string;
  endDate: string;
};

const QUICK_FILTERS = ["Active", "Inactive","Pipeline","Completed", "Total"];

function toListProject(p: ProjectApi): Project {
  const start = typeof p.startDate === "string" ? p.startDate : (p.startDate as unknown as string)?.slice?.(0, 10) ?? "";
  const end = typeof p.endDate === "string" ? p.endDate : (p.endDate as unknown as string)?.slice?.(0, 10) ?? "";
  return {
    id: p.id,
    projectName: p.name,
    projectCode: p.code,
    projectType: p.type,
    status: p.status,
    startDate: start,
    endDate: end,
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quickFilter, setQuickFilter] = useState<string>("Active");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const q = searchParams.get("search");
    if (q != null) setSearchInput(q);
  }, [searchParams]);

  const queryParams = useMemo(() => {
    const params: { status?: ProjectStatus; search?: string; limit: number; page: number } = {
      limit: 100,
      page: 1,
    };
    const hasSearch = searchInput.trim().length > 0;
    // When user is searching, fetch all projects (no status filter) so we can find matches in any status
    if (!hasSearch) {
      if (quickFilter === "Active") params.status = "Active";
      else if (quickFilter === "Inactive") params.status = "Draft";
      else if (quickFilter === "Completed") params.status = "Completed";
      else if (quickFilter === "Pipeline") params.status = "Draft";
    }
    if (hasSearch) params.search = searchInput.trim();
    return params;
  }, [quickFilter, searchInput]);

  const { data, isLoading, isError, error } = useGetProjectsQuery(queryParams);

  const allProjects = useMemo(() => (data?.data ?? []).map(toListProject), [data]);
  const projects = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    if (!term) return allProjects;
    return allProjects.filter(
      (p) =>
        p.projectName.toLowerCase().includes(term) ||
        (p.projectCode && p.projectCode.toLowerCase().includes(term)) ||
        (p.projectType && p.projectType.toLowerCase().includes(term))
    );
  }, [allProjects, searchInput]);
  const activeCount = data?.data?.filter((p) => p.status === "Active").length ?? 0;
  const draftCount = data?.data?.filter((p) => p.status === "Draft").length ?? 0;
  const totalCount = data?.meta?.totalItems ?? projects.length;

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-8">
        {/* Projects header – search across projects only */}
         {/* Projects section header */}
         <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard/projects/configuration")}
            className="px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700"
          >
            + New Project
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-10">
          <h1 className="text-2xl font-semibold text-gray-900">
            Good morning
          </h1>
          <p className="text-gray-500 mt-1">
            Search across projects
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button
              type="button"
              className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 shrink-0"
            >
              Search
            </button>
          </div>

          {/* Quick Filters */}
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

        {/* KPI cards – project reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-8">
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Active Projects</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{activeCount}</h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">{totalCount} total</p>
          </div>
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Draft Projects</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{draftCount}</h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">Pending setup</p>
          </div>
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Total Projects</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">{totalCount}</h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">All time</p>
          </div>
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Team Members</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">—</h3>
            <p className="text-sm text-gray-500 mt-2">No change</p>
          </div>
        </div>

       
        {/* Projects List - Container Box */}
        <div className="scrollbar-hide bg-white rounded-2xl border border-gray-200 p-6 max-h-[600px] overflow-y-auto">
          {isLoading && (
            <div className="p-8 text-center text-gray-500">
              Loading projects…
            </div>
          )}
          {isError && (
            <div className="p-8 text-center text-red-600">
              Failed to load projects. {(error as { data?: { message?: string } })?.data?.message ?? "Please try again."}
            </div>
          )}
          {!isLoading && !isError && projects.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No projects found
            </div>
          )}

          {!isLoading && !isError && projects.length > 0 && (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/dashboard/projects/${project.id}`}
                  className="block relative bg-white rounded-xl border border-gray-200 p-5 hover:border-green-500 transition-all group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl group-hover:bg-green-600" />
                  <div className="flex items-start justify-between gap-4 pl-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500 mb-1">
                        {project.startDate} – {project.endDate}
                      </p>
                      <h2 className="text-base font-semibold text-gray-900 mb-1.5">
                        {project.projectName}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {project.projectCode || "—"} • {project.projectType}
                      </p>
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium ${
                      project.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : project.status === "Completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
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
