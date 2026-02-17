"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetProjectsQuery, type ProjectApi } from "@/store/api/projectApiSlice";

const QUICK_FILTERS = ["My Active Projects", "Due This Week", "My Clients", "Open Deals"];

export default function ProjectsPage() {
  const [quickFilter, setQuickFilter] = useState<string>("My Active Projects");
  const router = useRouter();
  const { data: projectsData, isLoading, isError } = useGetProjectsQuery({ page: 1, limit: 50 });

  const activeCount = projectsData?.data.filter((p: ProjectApi) => p.status === "Active").length ?? 0;
  const draftCount = projectsData?.data.filter((p: ProjectApi) => p.status === "Draft").length ?? 0;
  const totalCount = projectsData?.meta?.totalItems ?? 0;

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
        <div className="custom-scrollbar bg-white rounded-2xl border border-gray-200 p-6 max-h-[600px] overflow-y-auto">
          {isLoading && (
            <div className="p-8 text-center text-gray-500">Loading projects…</div>
          )}
          {isError && (
            <div className="p-8 text-center text-red-600">Failed to load projects.</div>
          )}
          {!isLoading && !isError && (!projectsData?.data?.length) && (
            <div className="p-8 text-center text-gray-500">
              No projects yet. Create your first project to get started.
            </div>
          )}

          {!isLoading && !isError && projectsData?.data && projectsData.data.length > 0 && (
            <div className="space-y-3">
              {projectsData.data.map((project: ProjectApi, index: number) => (
                <Link
                  key={project.projectId ?? index}
                  href={`/admin/dashboard/projects/${project.projectId}`}
                  className="block relative bg-white rounded-xl border border-gray-200 p-5 hover:border-green-500 transition-all group"
                >
                  {/* Green Left Accent Bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl group-hover:bg-green-600"></div>
                  
                  <div className="flex items-start justify-between gap-4 pl-4">
                    <div className="min-w-0 flex-1">
                      {/* Time/Date Info - Top */}
                      <p className="text-sm text-gray-500 mb-1">
                        {project.startDate} - {project.endDate}
                      </p>
                      
                      {/* Title - Bold */}
                      <h2 className="text-base font-semibold text-gray-900 mb-1.5">
                        {project.projectName}
                      </h2>
                      
                      {/* Details - Bottom */}
                      <p className="text-sm text-gray-500">
                        {project.projectCode || "—"} • {project.projectType}
                      </p>
                    </div>
                    
                    {/* Status Tag - Top Right */}
                    <span className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium ${
                      project.status === "Active"
                        ? "bg-green-100 text-green-700"
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
