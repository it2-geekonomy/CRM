"use client";

import { useAppSelector } from "@/store/hooks";
import { useGetProjectsQuery, type ProjectStatus } from "@/store/api/projectApiSlice";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

const SEARCH_FILTERS = ["All", "Projects", "Clients", "Employee", "Leads", "Sales"];
const QUICK_FILTERS = ["Active", "Inactive", "Pipeline", "Completed", "Total"];

function getDisplayName(email: string | undefined): string {
  if (!email) return "User";
  const part = email.split("@")[0];
  return part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : "User";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeBtn, setActiveBtn] = useState("My Active Projects");
  const [searchFilter, setSearchFilter] = useState<string | null>(null);
  const [previousFilter, setPreviousFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectSearchInput, setProjectSearchInput] = useState("");
  const [quickFilter, setQuickFilter] = useState<string>("Active");
  const isProjectsView = searchFilter === "Projects";
  const user = useAppSelector((s) => s.auth.currentUser?.user);
  const displayName = (user as { name?: string } | undefined)?.name ?? getDisplayName(user?.email);

  // Restore filter state from sessionStorage when component mounts
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedFilter = sessionStorage.getItem("dashboardFilter");
    if (savedFilter) {
      setSearchFilter(savedFilter);
      sessionStorage.removeItem("dashboardFilter"); // Clear after restoring
    }
  }, []);

  // Handle back button - restore previous filter (go back to "All" or null)
  const handleBack = () => {
    setSearchFilter(null); // Reset to default (All)
    setProjectSearchInput("");
    setSearchQuery("");
  };

  // Track previous filter when filter changes
  const handleFilterChange = (filter: string) => {
    if (filter === "Clients") {
      router.push("/admin/dashboard/clients");
      return;
    }
    if (filter === "All") {
      // Reset to default state
      setSearchFilter(null);
      setProjectSearchInput("");
      setSearchQuery("");
      return;
    }
    setPreviousFilter(searchFilter); // Save current filter as previous
    setSearchFilter(filter);
    if (filter === "Projects") {
      setProjectSearchInput(searchQuery.trim());
    }
  };
  const buttons = [
    "My Active Projects",
    "Due This Week",
    "My Clients",
    "Open Deals",
  ];
  const projectQuery = useMemo(() => {
    const params: { status?: ProjectStatus; search?: string; limit: number; page: number } = {
      limit: 100,
      page: 1,
    };
    const hasSearch = projectSearchInput.trim().length > 0;
    if (!hasSearch) {
      if (quickFilter === "Active") params.status = "Active";
      else if (quickFilter === "Inactive") params.status = "Draft";
      else if (quickFilter === "Completed") params.status = "Completed";
      else if (quickFilter === "Pipeline") params.status = "Draft";
    }
    if (hasSearch) params.search = projectSearchInput.trim();
    return params;
  }, [quickFilter, projectSearchInput]);
  const { data, isLoading, isError } = useGetProjectsQuery(projectQuery, {
    skip: !isProjectsView,
  });
  const activeCount = data?.data?.filter((p) => p.status === "Active").length ?? 0;
  const draftCount = data?.data?.filter((p) => p.status === "Draft").length ?? 0;
  const totalCount = data?.meta?.totalItems ?? data?.data?.length ?? 0;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      {/* Back Button - Always reserve space to prevent layout shift */}
      <div className="mb-4 pl-8 h-10">
        {searchFilter && (
          <button
            type="button"
            onClick={handleBack}
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
        )}
      </div>
      {/* WIDER CONTAINER */}
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Top Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Good morning, {displayName}
          </h2>
          <p className="text-base text-gray-500 mt-2">
            Search across projects, clients, resources, leads, and sales
          </p>

          {/* Search Row */}
          <div className="flex items-center gap-4 mt-6">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPreviousFilter(searchFilter);
                  setProjectSearchInput(searchQuery.trim());
                  setSearchFilter("Projects");
                }
              }}
              className="flex-1 px-5 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="flex bg-gray-100 p-1.5 rounded-xl">
              {SEARCH_FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleFilterChange(item)}
                  className={`px-5 py-3 text-base rounded-lg transition-colors ${
                    (item === "All" && searchFilter === null) || searchFilter === item
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setProjectSearchInput(searchQuery.trim());
                setSearchFilter("Projects");
              }}
              className="bg-green-600 text-white px-8 py-4 rounded-xl text-base font-medium hover:bg-green-700"
            >
              Search
            </button>
          </div>

          {/* Quick Buttons */}
          <div className="flex gap-4 mt-5">
      {buttons.map((btn) => (
        <button
          key={btn}
          onClick={() => {
            setActiveBtn(btn);
            if (btn === "My Clients") {
              router.push("/admin/dashboard/clients");
            }
          }}
          className="px-6 py-3 rounded-xl text-base transition-all duration-200 border border-gray-200 bg-white text-gray-700 hover:border-green-500 hover:text-green-700"
        >
          {btn}
        </button>
      ))}
    </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Active Projects</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">
              12
            </h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">
              ↑ 3 from last week
            </p>
          </div>

          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Tasks This Week</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">
              24
            </h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">
              ↑ 8 completed
            </p>
          </div>

          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Hours Logged</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">
              32h
            </h3>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-green-600">
              ↑ 4h from last week
            </p>
          </div>

          <div className="group bg-white p-7 rounded-2xl border border-gray-200 transition-colors hover:border-green-500">
            <p className="text-base text-gray-500">Team Members</p>
            <h3 className="text-3xl font-semibold text-gray-900 mt-3">
              8
            </h3>
            <p className="text-sm text-gray-500 mt-2">No change</p>
          </div>
        </div>
        {isProjectsView && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Projects</h3>
              <button
                type="button"
                onClick={() => router.push("/admin/dashboard/projects/configuration")}
                className="px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700"
              >
                + New Project
              </button>
            </div>

            <div className="mt-2 flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search projects..."
                value={projectSearchInput}
                onChange={(e) => setProjectSearchInput(e.target.value)}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-6">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Active Projects</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{activeCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Draft Projects</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{draftCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total Projects</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{totalCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Team Members</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">—</p>
              </div>
            </div>

            {isLoading && <div className="text-gray-500 py-6">Loading projects...</div>}
            {isError && <div className="text-red-600 py-6">Failed to load projects.</div>}
            {!isLoading && !isError && (data?.data?.length ?? 0) === 0 && (
              <div className="text-gray-500 py-6">No projects found.</div>
            )}
            {!isLoading && !isError && (data?.data?.length ?? 0) > 0 && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {data?.data.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      // Save current filter state before navigating
                      if (typeof window !== "undefined" && searchFilter) {
                        sessionStorage.setItem("dashboardFilter", searchFilter);
                      }
                      router.push(`/admin/dashboard/projects/${project.id}`);
                    }}
                    className="w-full text-left rounded-xl border border-gray-200 p-5 hover:border-green-500 transition-colors group relative"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl group-hover:bg-green-600" />
                    <div className="pl-4">
                      <p className="text-sm text-gray-500">{project.code || "—"}</p>
                      <p className="text-base font-semibold text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.type} • {project.status}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {/* BELOW DASHBOARD SECTION */}
{!isProjectsView && (
<div className="mt-10">
  {/* Today's Schedule */}
  <div className="bg-white rounded-2xl border border-gray-200 p-8">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Today's Schedule
      </h3>
      <button
        type="button"
        onClick={() => router.push("/admin/dashboard/tasks")}
        className="text-green-600 text-sm font-medium hover:underline"
      >
        View Calendar
      </button>
    </div>

    <div className="space-y-4">
      {/* Schedule Item */}
      <div className="flex gap-4 p-5 border-t border-r border-b border-gray-200 border-l-4 border-l-green-500 rounded-xl transition-colors cursor-pointer hover:bg-gray-50 hover:border-l-green-700">
        <div>
          <p className="text-sm text-gray-500">
            09:00 - 10:00 AM
          </p>
          <p className="font-medium text-gray-900 mt-1">
            Design Review - ABC Corp Website
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Conference Room A • 3 participants
          </p>
        </div>
      </div>

      <div className="flex gap-4 p-5 border-t border-r border-b border-gray-200 border-l-4 border-l-green-500 rounded-xl transition-colors cursor-pointer hover:bg-gray-50 hover:border-l-green-700">
        <div>
          <p className="text-sm text-gray-500">
            11:30 AM - 12:30 PM
          </p>
          <p className="font-medium text-gray-900 mt-1">
            Client Presentation - Fashion Brand
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Video Call • 5 participants
          </p>
        </div>
      </div>

      <div className="flex gap-4 p-5 border-t border-r border-b border-gray-200 border-l-4 border-l-green-500 rounded-xl transition-colors cursor-pointer hover:bg-gray-50 hover:border-l-green-700">
        <div>
          <p className="text-sm text-gray-500">05:00 PM</p>
          <p className="font-medium text-gray-900 mt-1">
            Homepage Design Mockup Deadline
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Design Task • High Priority
          </p>
        </div>
      </div>

      <div className="flex gap-4 p-5 border-t border-r border-b border-gray-200 border-l-4 border-l-green-500 rounded-xl transition-colors cursor-pointer hover:bg-gray-50 hover:border-l-green-700">
        <div>
          <p className="text-sm text-gray-500">06:00 PM</p>
          <p className="font-medium text-gray-900 mt-1">
            Brand Guidelines Review
          </p>
          <p className="text-sm text-gray-500 mt-1">
            XYZ Corp • 1 hour
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
)}
      </div>
    </div>
  );
}
