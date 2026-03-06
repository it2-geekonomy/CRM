"use client";

import { useEffect, useState } from "react";
import DepartmentTaskTypeAccordion from "@/shared/constants/components/configuration/DepartmentTaskTypeAccordion";
import ProjectTypeAccordion from "@/shared/constants/components/configuration/ProjectTypeAccordion";
import { TaskType } from "./types";
import type { ProjectTypeApi } from "@/store/api/projectTypeApiSlice";
import { useGetProjectTypesQuery } from "@/store/api/projectTypeApiSlice";
import type { DepartmentWithTaskTypesApi } from "@/store/api/departmentApiSlice";
import { useGetDepartmentsWithTaskTypesQuery } from "@/store/api/departmentApiSlice";

export default function ConfigPage() {
  const [departments, setDepartments] = useState<DepartmentWithTaskTypesApi[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectTypeApi[]>([]);
  const [deptExpandedIds, setDeptExpandedIds] = useState<Set<string>>(new Set());
  const [projectExpandedIds, setProjectExpandedIds] = useState<Set<string>>(new Set());

  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartmentsWithTaskTypesQuery();
  const { data: projectTypesData, isLoading: projectTypesLoading } = useGetProjectTypesQuery();

  useEffect(() => {
    if (departmentsData) setDepartments(departmentsData);
  }, [departmentsData]);

  useEffect(() => {
    if (projectTypesData) setProjectTypes(projectTypesData);
  }, [projectTypesData]);

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

  const addDepartmentToProject = (projectId: string, department: { id: string; name: string }) => {
    const deptToAdd = {
      id: department.id,
      name: department.name,
      code: null as string | null,
      description: null as string | null,
      projectTypeId: projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjectTypes((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, departments: [...(project.departments ?? []), deptToAdd] }
          : project
      )
    );
  };

  const removeDepartmentFromProject = (projectId: string, departmentId: string) => {
    setProjectTypes((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, departments: (project.departments ?? []).filter((d) => d.id !== departmentId) }
          : project
      )
    );
  };

  const addConfiguration = (departmentId: string, config: TaskType) => {
    const newTaskType = {
      id: crypto.randomUUID(),
      name: config.name,
      description: config.description || undefined,
      billable: config.billable,
      slaHours: config.slaHours !== "" ? Number(config.slaHours) : undefined,
      status: config.status,
    };
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.id === departmentId
          ? { ...dept, taskTypes: [...(dept.taskTypes ?? []), newTaskType] }
          : dept
      )
    );
  };

  const deleteConfiguration = (departmentId: string, configId: string) => {
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.id === departmentId
          ? { ...dept, taskTypes: (dept.taskTypes ?? []).filter((t) => t.id !== configId) }
          : dept
      )
    );
  };

  const allDepartmentsForProjects = departments.map((d) => ({ id: d.id, name: d.name }));

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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

        {departmentsLoading && <p className="text-sm text-gray-500 py-2">Loading departments…</p>}
        <div className="space-y-4 mb-10">
          {!departmentsLoading && departments.map((dept, index) => (
            <DepartmentTaskTypeAccordion
              key={dept.id}
              department={dept}
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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

        {projectTypesLoading && <p className="text-sm text-gray-500 py-2">Loading project types…</p>}
        <div className="space-y-4">
          {!projectTypesLoading && projectTypes.map((project, index) => (
            <ProjectTypeAccordion
              key={project.id}
              projectType={project}
              allDepartments={allDepartmentsForProjects}
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