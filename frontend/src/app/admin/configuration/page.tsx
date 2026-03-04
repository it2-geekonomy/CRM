"use client";

import { useEffect, useState } from "react";
import DepartmentTaskTypeAccordion from "@/shared/constants/components/configuration/DepartmentTaskTypeAccordion";
import ProjectTypeAccordion from "@/shared/constants/components/configuration/ProjectTypeAccordion";
import { Department, TaskType, ProjectType } from "./types";

export default function ConfigPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [deptExpandedIds, setDeptExpandedIds] = useState<Set<string>>(new Set());
  const [projectExpandedIds, setProjectExpandedIds] = useState<Set<string>>(new Set());

  // Replace with real API call when ready:
  // fetch("/api/departments").then(r => r.json()).then(setDepartments)
  useEffect(() => {
    setDepartments([
      {
        id: "1",
        name: "Sales",
        configurations: [
          {
            id: "c1",
            name: "Lead Qualification",
            description: "Qualify incoming leads",
            billable: true,
            slaHours: "24",
            status: "Active",
            tasks: "Call, Email",
          },
          {
            id: "c2",
            name: "Client Follow-up",
            description: "Follow up with potential clients",
            billable: false,
            slaHours: "48",
            status: "Active",
            tasks: "Email reminder",
          },
        ],
      },
      {
        id: "2",
        name: "Design",
        configurations: [
          {
            id: "c3",
            name: "UI Design",
            description: "Create UI mockups",
            billable: true,
            slaHours: "72",
            status: "Active",
            tasks: "Figma draft",
          },
        ],
      },
      {
        id: "3",
        name: "Development",
        configurations: [],
      },
      {
        id: "4",
        name: "Social Media",
        configurations: [],
      },
    ]);

    setProjectTypes([
      {
        id: "p1",
        name: "Web Development",
        description: "Building responsive web applications with modern technologies",
        departments: [
          { id: "1", name: "Design", configurations: [] },
          { id: "3", name: "Development", configurations: [] },
        ],
      },
      {
        id: "p2",
        name: "UI/UX Design",
        description: "Designing user interfaces and experiences for digital products",
        departments: [
          { id: "2", name: "Design", configurations: [] },
        ],
      },
      {
        id: "p3",
        name: "Mobile App Development",
        description: "Developing native and cross-platform mobile applications",
        departments: [
          { id: "3", name: "Development", configurations: [] },
        ],
      },
      {
        id: "p4",
        name: "API Development",
        description: "Building scalable RESTful and GraphQL APIs",
        departments: [
          { id: "3", name: "Development", configurations: [] },
          { id: "1", name: "Design", configurations: [] },
        ],
      },
    ]);
  }, []);

  const toggleDept  = (id: string) => {
    setDeptExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const deptExpandAll   = () => setDeptExpandedIds(new Set(departments.map((d) => d.id)));
  const deptCollapseAll = () => setDeptExpandedIds(new Set());

  const toggleProject  = (id: string) => {
    setProjectExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const projectExpandAll   = () => setProjectExpandedIds(new Set(projectTypes.map((p) => p.id)));
  const projectCollapseAll = () => setProjectExpandedIds(new Set());

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    setDeptExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const deleteProjectType = (id: string) => {
    setProjectTypes((prev) => prev.filter((p) => p.id !== id));
    setProjectExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const addDepartmentToProject = (projectId: string, department: Department) => {
    setProjectTypes((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, departments: [...project.departments, department] }
          : project
      )
    );
  };

  const removeDepartmentFromProject = (projectId: string, departmentId: string) => {
    setProjectTypes((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, departments: project.departments.filter((d) => d.id !== departmentId) }
          : project
      )
    );
  };

  const addConfiguration = (departmentId: string, config: TaskType) => {
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.id === departmentId
          ? { ...dept, configurations: [...dept.configurations, config] }
          : dept
      )
    );
  };

  const deleteConfiguration = (departmentId: string, configId: string) => {
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.id === departmentId
          ? { ...dept, configurations: dept.configurations.filter((c) => c.id !== configId) }
          : dept
      )
    );
  };

  // Adapt local Department shape → DepartmentWithTaskTypesApi shape expected by the accordion.
  // slaHours is stored as string locally but DepartmentTaskTypeApi expects number | undefined.
  const toApiShape = (dept: Department) => ({
    id: dept.id,
    name: dept.name,
    code: "",
    description: "",
    projectTypeId: "",
    createdAt: "",
    updatedAt: "",
    taskTypes: dept.configurations.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description || undefined,
      billable: c.billable,
      slaHours: c.slaHours !== "" ? Number(c.slaHours) : undefined,
      status: c.status,
    })),
  });

  return (
    <div className="w-full h-full overflow-y-auto bg-white">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10">

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 mb-2">
          Configuration
        </h1>

        {/* ──────────────── DEPARTMENTS SECTION ──────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 mb-6">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-green-600">
            Departments
          </h2>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={deptExpandAll}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 transition font-medium whitespace-nowrap"
            >
              Expand All
            </button>
            <button
              onClick={deptCollapseAll}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 transition font-medium whitespace-nowrap"
            >
              Collapse All
            </button>
            <button className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium whitespace-nowrap">
              + Add Department
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          {departments.map((dept, index) => (
            <DepartmentTaskTypeAccordion
              key={dept.id}
              department={toApiShape(dept)}
              colorIndex={index}
              isExpanded={deptExpandedIds.has(dept.id)}
              onToggle={() => toggleDept(dept.id)}
              onDelete={() => deleteDepartment(dept.id)}
              onAddConfiguration={addConfiguration}
              onDeleteConfiguration={deleteConfiguration}
            />
          ))}
        </div>

        {/* ──────────────── PROJECT TYPES SECTION ──────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 mb-6">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-green-600">
            Project Types
          </h2>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={projectExpandAll}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 transition font-medium whitespace-nowrap"
            >
              Expand All
            </button>
            <button
              onClick={projectCollapseAll}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 transition font-medium whitespace-nowrap"
            >
              Collapse All
            </button>
            <button className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium whitespace-nowrap">
              + Add Project Type
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {projectTypes.map((project, index) => (
            <ProjectTypeAccordion
              key={project.id}
              projectType={project}
              allDepartments={departments}
              colorIndex={index}
              isExpanded={projectExpandedIds.has(project.id)}
              onToggle={() => toggleProject(project.id)}
              onDelete={() => deleteProjectType(project.id)}
              onAddDepartment={addDepartmentToProject}
              onRemoveDepartment={removeDepartmentFromProject}
            />
          ))}
        </div>

      </div>
    </div>
  );
}