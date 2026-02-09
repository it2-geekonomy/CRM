"use client";

import { useAppSelector } from "@/store/hooks";
import { useState } from "react";

const SEARCH_FILTERS = ["All", "Projects", "Clients", "Resources", "Leads", "Sales"];

function getDisplayName(email: string | undefined): string {
  if (!email) return "User";
  const part = email.split("@")[0];
  return part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : "User";
}

export default function AdminDashboardPage() {
  const [activeBtn, setActiveBtn] = useState("My Active Projects");
  const [searchFilter, setSearchFilter] = useState<string | null>(null);
  const user = useAppSelector((s) => s.auth.currentUser?.user);
  const displayName = (user as { name?: string } | undefined)?.name ?? getDisplayName(user?.email);
  const buttons = [
    "My Active Projects",
    "Due This Week",
    "My Clients",
    "Open Deals",
  ];

  return (
    <div className="bg-gray-100 min-h-screen py-8">
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
              className="flex-1 px-5 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="flex bg-gray-100 p-1.5 rounded-xl">
              {SEARCH_FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSearchFilter(item)}
                  className={`px-5 py-3 text-base rounded-lg transition-colors ${
                    searchFilter === item
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <button className="bg-green-600 text-white px-8 py-4 rounded-xl text-base font-medium hover:bg-green-700">
              Search
            </button>
          </div>

          {/* Quick Buttons */}
          <div className="flex gap-4 mt-5">
      {buttons.map((btn) => (
        <button
          key={btn}
          onClick={() => setActiveBtn(btn)}
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
        {/* BELOW DASHBOARD SECTION */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
  {/* Today's Schedule */}
  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-8">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Today's Schedule
      </h3>
      <button className="text-green-600 text-sm font-medium hover:underline">
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

  {/* Quick Actions */}
  <div className="bg-white rounded-2xl border border-gray-200 p-8">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Quick Actions
    </h3>

    <span className="inline-block mb-5 px-3 py-1 text-sm border border-gray-200 rounded-lg text-gray-700">
      Designer
    </span>

    <div className="space-y-4">
      {[
        {
          title: "New Design",
          desc: "Start a design task",
          icon: "🎨",
        },
        {
          title: "Upload Assets",
          desc: "Add files to project",
          icon: "📤",
        },
        {
          title: "Submit Review",
          desc: "Send to client",
          icon: "✅",
        },
        {
          title: "Log Time",
          desc: "Track hours",
          icon: "⏱️",
        },
        {
          title: "Request Feedback",
          desc: "Get team input",
          icon: "💬",
        },
        {
          title: "My Projects",
          desc: "View all work",
          icon: "📊",
        },
      ].map((item) => (
        <div
          key={item.title}
          className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl transition-colors cursor-pointer hover:bg-gray-50 hover:border-green-500"
        >
          <div className="text-2xl">{item.icon}</div>
          <div>
            <p className="font-medium text-gray-900">
              {item.title}
            </p>
            <p className="text-sm text-gray-500">
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

      </div>
    </div>
  );
}
