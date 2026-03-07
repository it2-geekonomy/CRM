"use client";

import { useEffect, useState } from "react";
import DepartmentTaskTypeAccordion from "@/shared/constants/components/configuration/DepartmentTaskTypeAccordion";
import ProjectTypeAccordion from "@/shared/constants/components/configuration/ProjectTypeAccordion";
import { Department, TaskType, ProjectType } from "./types";
import type { DepartmentWithTaskTypesApi, DepartmentTaskTypeApi } from "@/store/api/departmentApiSlice";
import type { ProjectTypeApi, CreateProjectTypeRequest } from "@/store/api/projectTypeApiSlice";
import { useGetDepartmentsWithTaskTypesQuery } from "@/store/api/departmentApiSlice";
import { useGetProjectTypesQuery, useCreateProjectTypeMutation, useUpdateProjectTypeMutation, useDeleteProjectTypeMutation } from "@/store/api/projectTypeApiSlice";
import { useCreateTaskTypeMutation } from "@/store/api/taskTypeApiSlice";
import CreateProjectTypeModal from "@/shared/constants/components/configuration/CreateProjectTypeModal";

/** Map API task type to local config shape (slaHours as string, optional tasks). */
function taskTypeToConfig(t: DepartmentTaskTypeApi): TaskType {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    billable: t.billable,
    slaHours: t.slaHours != null ? String(t.slaHours) : "",
    status: t.status as TaskType["status"],
    tasks: "",
  };
}

/** Map API department (with task types) to local Department shape (configurations). */
function apiDepartmentToLocal(api: DepartmentWithTaskTypesApi): Department {
  return {
    id: api.id,
    name: api.name,
    configurations: (api.taskTypes ?? []).map(taskTypeToConfig),
  };
}

/** Map API project type to local ProjectType shape (all project types and their departments). */
function apiProjectTypeToLocal(api: ProjectTypeApi): ProjectType {
  return {
    id: api.id,
    name: api.name,
    description: api.description ?? "",
    departments: (api.departments ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      configurations: [] as TaskType[],
    })),
  };
}

export default function ConfigPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [deptExpandedIds, setDeptExpandedIds] = useState<Set<string>>(new Set());
  const [projectExpandedIds, setProjectExpandedIds] = useState<Set<string>>(new Set());
  const [showAddProjectTypeModal, setShowAddProjectTypeModal] = useState(false);

  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartmentsWithTaskTypesQuery();
  const { data: projectTypesData, isLoading: projectTypesLoading } = useGetProjectTypesQuery();
  const [createProjectType, { isLoading: isCreatingProjectType }] = useCreateProjectTypeMutation();
  const [updateProjectTypeMutation] = useUpdateProjectTypeMutation();
  const [deleteProjectTypeMutation, { isLoading: isDeletingProjectType }] = useDeleteProjectTypeMutation();
  const [createTaskType] = useCreateTaskTypeMutation();

  useEffect(() => {
    if (!departmentsData) return;
    setDepartments(departmentsData.map(apiDepartmentToLocal));
  }, [departmentsData]);

  useEffect(() => {
    if (!projectTypesData) return;
    // Show all project types and their departments; exclude soft-deleted
    const active = projectTypesData.filter((pt) => !pt.deletedAt);
    setProjectTypes(active.map(apiProjectTypeToLocal));
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

  const deleteProjectType = async (id: string) => {
    try {
      await deleteProjectTypeMutation(id).unwrap();
      setProjectExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error("Failed to delete project type:", err);
    }
  };

  const addDepartmentToProject = async (projectId: string, department: Department) => {
    const project = projectTypes.find((p) => p.id === projectId);
    if (!project) return;
    const currentIds = (project.departments ?? []).map((d) => d.id);
    if (currentIds.includes(department.id)) return;
    const departmentIds = [...currentIds, department.id];
    try {
      await updateProjectTypeMutation({ id: projectId, body: { departmentIds } }).unwrap();
    } catch (err) {
      console.error("Failed to add department to project type:", err);
    }
  };

  const removeDepartmentFromProject = async (projectId: string, departmentId: string) => {
    const project = projectTypes.find((p) => p.id === projectId);
    if (!project) return;
    const departmentIds = (project.departments ?? []).filter((d) => d.id !== departmentId).map((d) => d.id);
    try {
      await updateProjectTypeMutation({ id: projectId, body: { departmentIds } }).unwrap();
    } catch (err) {
      console.error("Failed to remove department from project type:", err);
    }
  };

  const addConfiguration = async (departmentId: string, config: TaskType) => {
    try {
      await createTaskType({
        name: config.name,
        description: config.description || undefined,
        departmentId,
        billable: config.billable,
        slaHours: config.slaHours !== "" ? Number(config.slaHours) : undefined,
        status: config.status,
      }).unwrap();
    } catch (err) {
      console.error("Failed to create task type:", err);
      throw err;
    }
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

  const handleCreateProjectType = async (body: CreateProjectTypeRequest) => {
    try {
      await createProjectType(body).unwrap();
      setShowAddProjectTypeModal(false);
    } catch (err) {
      console.error("Failed to create project type:", err);
    }
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

        {departmentsLoading && (
          <p className="text-sm text-gray-500 py-2">Loading departments…</p>
        )}
        <div className="space-y-4 mb-10">
          {!departmentsLoading && departments.map((dept, index) => (
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
            <button
              type="button"
              onClick={() => setShowAddProjectTypeModal(true)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium whitespace-nowrap"
            >
              + Add Project Type
            </button>
          </div>
        </div>

        {projectTypesLoading && (
          <p className="text-sm text-gray-500 py-2">Loading project types…</p>
        )}
        <div className="space-y-4">
          {!projectTypesLoading && projectTypes.map((project, index) => (
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

        {showAddProjectTypeModal && (
          <CreateProjectTypeModal
            departments={departments.map((d) => ({ id: d.id, name: d.name }))}
            onSubmit={handleCreateProjectType}
            onClose={() => setShowAddProjectTypeModal(false)}
            isSubmitting={isCreatingProjectType}
          />
        )}
      </div>
    </div>
  );
}