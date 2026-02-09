"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type Project = {
  id: number;
  projectName: string;
  client: string;
  projectType: string;
  status: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  hourlyRate: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("projects");
    const savedProjects: Project[] = JSON.parse(raw ?? "[]");
    setProjects(savedProjects);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Projects
          </h1>
          <button
        onClick={() => router.push("/admin/dashboard/projects/configuration")}
        className="px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700"
      >
        + New Project
      </button>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {projects.length === 0 && (
            <div className="bg-white p-8 rounded-xl border text-center text-gray-500">
              No projects created yet
            </div>
          )}

          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-green-500 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {project.projectName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.client} • {project.projectType}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-lg text-sm bg-yellow-100 text-yellow-700">
                  {project.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p className="font-medium">{project.startDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">End Date</p>
                  <p className="font-medium">{project.endDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estimated Hours</p>
                  <p className="font-medium">{project.estimatedHours}</p>
                </div>
                <div>
                  <p className="text-gray-500">Hourly Rate</p>
                  <p className="font-medium">{project.hourlyRate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
