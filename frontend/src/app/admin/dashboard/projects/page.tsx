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

  // Fetch all projects for counts (no status filter)
  const { data: allProjectsData } = useGetProjectsQuery(
    { limit: 1000, page: 1 },
    { skip: false }
  );

  const queryParams = useMemo(() => {
    const params: { status?: ProjectStatus; search?: string; limit: number; page: number } = {
      limit: 100,
      page: 1,
    };
    const hasSearch = searchInput.trim().length > 0;
    // When user is searching, fetch all projects (no status filter) so we can find matches in any status
    if (!hasSearch) {
      if (quickFilter === "Active") params.status = "Active";
      else if (quickFilter === "Inactive") params.status = "Inactive";
      else if (quickFilter === "Completed") params.status = "Completed";
      else if (quickFilter === "Pipeline") params.status = "Pipeline";
      // "Total" - no status filter, fetch all
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
  
  // Calculate counts from all projects (not filtered)
  const activeCount = allProjectsData?.data?.filter((p) => p.status === "Active").length ?? 0;
  const inactiveCount = allProjectsData?.data?.filter((p) => p.status === "Inactive").length ?? 0;
  const pipelineCount = allProjectsData?.data?.filter((p) => p.status === "Pipeline").length ?? 0;
  const completedCount = allProjectsData?.data?.filter((p) => p.status === "Completed").length ?? 0;
  const totalCount = allProjectsData?.meta?.totalItems ?? allProjectsData?.data?.length ?? 0;

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      {/* Back Button */}
      <div className="mb-4 pl-8 h-10">
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
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

        {/* Status Count Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{activeCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Inactive</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{inactiveCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Pipeline</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{pipelineCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{completedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{totalCount}</p>
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
