"use client";

import type { Project } from "../page";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Dummy project for demo when API/localStorage has no data
const DUMMY_PROJECT: Project = {
  id: 0,
  projectName: "ABC Corp Website Redesign",
  projectCode: "ABC-WEB-001",
  client: "ABC Corporation",
  projectType: "Website Design & Development",
  description: "Complete website redesign including homepage, 5 internal pages, responsive design, and CMS integration.",
  status: "Draft",
  startDate: "2026-02-04",
  endDate: "2026-05-15",
  estimatedHours: 320,
  hourlyRate: "$150",
};

const DUMMY_TEAM = [
  { initials: "RK", name: "Rajesh Kumar", role: "Lead Designer" },
  { initials: "PD", name: "Priya Desai", role: "Frontend Developer" },
  { initials: "AV", name: "Amit Verma", role: "Backend Developer" },
];

export default function ProjectDetailsPage() {
  const params = useParams();
  const idParam = params?.id;
  const idStr = Array.isArray(idParam) ? idParam?.[0] : idParam;
  const idFromUrl = idStr != null && idStr !== "" ? Number(idStr) : null;
  const resolvedId = idFromUrl != null && !Number.isNaN(idFromUrl) ? idFromUrl : 1;
  const [project, setProject] = useState<Project | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("projects");
      const projects: Project[] = raw ? JSON.parse(raw) : [];
      const found = projects.find((p) => Number(p.id) === Number(resolvedId));
      setProject(found ?? { ...DUMMY_PROJECT, id: resolvedId });
    } catch {
      setProject({ ...DUMMY_PROJECT, id: resolvedId });
    } finally {
      setLoaded(true);
    }
  }, [resolvedId]);

  if (!loaded) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading project…</p>
        </div>
      </div>
    );
  }

  const displayProject = project ?? { ...DUMMY_PROJECT, id: resolvedId };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin/dashboard/projects"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Projects
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Project Details</h1>
          <p className="text-gray-500 mt-2">
            Set up and manage your project settings, team members, and deliverables
          </p>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
              displayProject.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {displayProject.status}
            </span>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Project Name</p>
              <p className="mt-1 text-gray-900">{displayProject.projectName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Project Code</p>
              <p className="mt-1 text-gray-900">{displayProject.projectCode || "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">Auto-generated if left blank</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Client</p>
              <p className="mt-1 text-gray-900">{displayProject.client}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Project Type</p>
              <p className="mt-1 text-gray-900">{displayProject.projectType}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Project Description</p>
              <p className="mt-1 text-gray-700 whitespace-pre-wrap">{displayProject.description || "—"}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="pb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Start Date</p>
              <p className="mt-1 text-gray-900">{displayProject.startDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">End Date</p>
              <p className="mt-1 text-gray-900">{displayProject.endDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Estimated Hours</p>
              <p className="mt-1 text-gray-900">{displayProject.estimatedHours}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
              <p className="mt-1 text-gray-900">{displayProject.hourlyRate}</p>
            </div>
          </div>
        </div>

        {/* Team Assignment */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Team Assignment</h2>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500">Project Manager</p>
            <p className="mt-1 text-gray-900">Arjun Sindhia</p>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500 mb-3">Team Members</p>
            <div className="space-y-4">
              {DUMMY_TEAM.map((m) => (
                <div
                  key={m.initials}
                  className="flex items-center justify-between border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-medium text-sm">
                      {m.initials}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{m.name}</p>
                      <p className="text-sm text-gray-500">{m.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File Attachments */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="pb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">File Attachments</h2>
          </div>
          <div className="mt-6 py-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center text-gray-500 text-sm">
            No files attached. Attachments can be added when editing the project.
          </div>
        </div>
      </div>
    </div>
  );
}
