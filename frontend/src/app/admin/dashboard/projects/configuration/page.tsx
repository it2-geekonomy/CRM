"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useEffect } from "react";
import { useGetEmployeesQuery } from "@/store/api/employeeApiSlice";
import { useGetAdminsQuery } from "@/store/api/adminApiSlice";
import {
  useCreateProjectMutation,
  type ProjectType,
  type ProjectStatus,
} from "@/store/api/projectApiSlice";
import type { Employee } from "@/store/api/employeeApiSlice";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.gif,.webp,image/*";

type FileEntry = { file: File; objectUrl?: string };

const DEFAULT_PROJECT_NAME = "ABC Corp Website Redesign";
const DEFAULT_PROJECT_CODE = "ABC-WEB-001";
const DEFAULT_CLIENT = "ABC Corporation";
const DEFAULT_PROJECT_TYPE = "Website Design & Development";
const DEFAULT_DESCRIPTION = "Complete website redesign including homepage, 5 internal pages, responsive design, and CMS integration.";

const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: "Website", label: "Website Design & Development" },
  { value: "App", label: "Mobile App Development" },
  { value: "CRM", label: "CRM" },
  { value: "Internal", label: "Internal / Branding" },
];

export default function ProjectConfigurationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMemberButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [projectName, setProjectName] = useState(DEFAULT_PROJECT_NAME);
  const [projectCode, setProjectCode] = useState(DEFAULT_PROJECT_CODE);
  const [client, setClient] = useState(DEFAULT_CLIENT);
  const [projectType, setProjectType] = useState<ProjectType>("Website");
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [startDate, setStartDate] = useState("2026-02-04");
  const [endDate, setEndDate] = useState("2026-05-15");
  const [estimatedHours, setEstimatedHours] = useState(320);
  const [projectManagerId, setProjectManagerId] = useState("");
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [addMemberDropdownOpen, setAddMemberDropdownOpen] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: employeesData } = useGetEmployeesQuery({ limit: 100 });
  const { data: adminsData } = useGetAdminsQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();

  const employees = employeesData?.data ?? [];
  const admins = Array.isArray(adminsData) ? adminsData : [];
  const alreadyAddedIds = new Set(teamMembers.map((m) => m.id));
  const availableEmployees = employees.filter((e) => !alreadyAddedIds.has(e.id));

  useEffect(() => {
    if (admins.length > 0 && !projectManagerId) setProjectManagerId(admins[0].id);
  }, [admins, projectManagerId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        addMemberDropdownOpen &&
        dropdownRef.current &&
        addMemberButtonRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !addMemberButtonRef.current.contains(e.target as Node)
      ) {
        setAddMemberDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [addMemberDropdownOpen]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `${file.name} exceeds ${MAX_FILE_SIZE_MB}MB`;
    }
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles?.length) return;
    setUploadError(null);
    const toAdd: FileEntry[] = [];
    const errors: string[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const err = validateFile(file);
      if (err) errors.push(err);
      else {
        const objectUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        toAdd.push({ file, objectUrl });
      }
    }
    if (errors.length) setUploadError(errors[0]);
    if (toAdd.length) setFiles((prev) => [...prev, ...toAdd]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    addFiles(selected);
    e.target.value = "";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const entry = prev[index];
      if (entry?.objectUrl) URL.revokeObjectURL(entry.objectUrl);
      return prev.filter((_, i) => i !== index);
    });
    setUploadError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const mapUiProjectTypeToApi = (ui: string): ProjectType => {
    if (ui.includes("Website")) return "Website";
    if (ui.includes("Mobile") || ui.includes("App")) return "App";
    if (ui.includes("CRM")) return "CRM";
    return "Internal";
  };

  const saveProject = async (status: "Draft" | "Active") => {
    const apiStatus: ProjectStatus = status === "Draft" ? "Draft" : "Active";
    const apiProjectType = mapUiProjectTypeToApi(projectType);

    if (!projectManagerId || teamMembers.length === 0) {
      alert("Please select a Project Manager and add at least one team member (project lead).");
      return;
    }

    const projectLeadId = teamMembers[0].id;

    try {
      await createProject({
        projectName: projectName.trim() || "Untitled Project",
        projectCode: projectCode.trim() || undefined,
        projectType: apiProjectType,
        projectDescription: description.trim() || undefined,
        status: apiStatus,
        startDate,
        endDate,
        estimatedHours: Number(estimatedHours) || 320,
        projectManagerId,
        projectLeadId,
        requireTimeTracking: false,
      }).unwrap();
      router.push("/admin/dashboard/projects");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to create project.";
      alert(message ?? "Failed to create project.");
    }
  };

  const handleCancel = () => {
    router.push("/admin/dashboard/projects");
  };

  return (
      <div className="bg-gray-100 min-h-screen py-10">
        <div className="max-w-[1200px] mx-auto px-8">
          
          {/* PAGE HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">
              Project Configuration
            </h1>
            <p className="text-gray-500 mt-2">
              Set up and manage your project settings, team members, and deliverables
            </p>
          </div>
  
          {/* BASIC INFORMATION CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            
            {/* Section Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>
              <span className="px-3 py-1 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700">
                Draft
              </span>
            </div>
  
            {/* FORM */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Project Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
  
              {/* Project Code */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Project Code
                </label>
                <input
                  type="text"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Auto-generated if left blank
                </p>
              </div>
  
              {/* Client */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="ABC Corporation">ABC Corporation</option>
                  <option value="XYZ Corp">XYZ Corp</option>
                </select>
              </div>
  
  {/* Project Type */}
  <div>
    <label className="text-sm font-medium text-gray-700">
      Project Type
    </label>
    <select
      value={projectType}
      onChange={(e) => setProjectType(e.target.value as ProjectType)}
      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-green-500"
    >
      {PROJECT_TYPE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
  
              {/* Project Description */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Project Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none resize-none"
                />
              </div>
  
            </div>
          </div>

         {/* TIMELINE SECTION */}
<div className="bg-white rounded-2xl border border-gray-200 p-8 mt-8">
  
  {/* Section Header */}
  <div className="pb-4 border-b">
    <h2 className="text-lg font-semibold text-gray-900">
      Timeline
    </h2>
  </div>

  {/* FORM */}
  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
    
    {/* Start Date */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Start Date <span className="text-red-500">*</span>
      </label>
      <div className="relative mt-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-4 py-3 pr-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
        />
        
      </div>
    </div>

    {/* End Date */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        End Date <span className="text-red-500">*</span>
      </label>
      <div className="relative mt-2">
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-4 py-3 pr-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
        />
        
      </div>
    </div>

    {/* Estimated Hours */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Estimated Hours
      </label>
      <input
        type="number"
        value={estimatedHours}
        onChange={(e) => setEstimatedHours(Number(e.target.value) || 0)}
        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>

  </div>
</div>
{/* TEAM ASSIGNMENT SECTION */}
<div className="bg-white rounded-2xl border border-gray-200 p-8 mt-8">
  <div className="flex items-center justify-between pb-4 border-b relative">
    <h2 className="text-lg font-semibold text-gray-900">
      Team Assignment
    </h2>
    <button
      ref={addMemberButtonRef}
      type="button"
      onClick={() => setAddMemberDropdownOpen((o) => !o)}
      className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
    >
      + Add Member
    </button>
    {addMemberDropdownOpen && (
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-1 z-20 w-72 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1"
      >
        {availableEmployees.length === 0 ? (
          <p className="px-4 py-3 text-sm text-gray-500">No more employees to add</p>
        ) : (
          availableEmployees.map((emp) => (
            <button
              key={emp.id}
              type="button"
              onClick={() => {
                setTeamMembers((prev) => [...prev, emp]);
                setAddMemberDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium shrink-0">
                {emp.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{emp.name}</p>
                <p className="text-sm text-gray-500 truncate">{emp.designation}</p>
              </div>
            </button>
          ))
        )}
      </div>
    )}
  </div>

  {/* Project Manager */}
  <div className="mt-6">
    <label className="text-sm font-medium text-gray-700">
      Project Manager <span className="text-red-500">*</span>
    </label>
    <select
      value={projectManagerId}
      onChange={(e) => setProjectManagerId(e.target.value)}
      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-green-500"
    >
      {admins.map((admin) => (
        <option key={admin.id} value={admin.id}>
          {admin.name}
        </option>
      ))}
      {admins.length === 0 && (
        <option value="">— No admins —</option>
      )}
    </select>
  </div>

  {/* Team Members */}
  <div className="mt-6 space-y-4">
    <label className="text-sm font-medium text-gray-700">
      Team Members
    </label>
    {teamMembers.length === 0 ? (
      <p className="text-sm text-gray-500 py-2">No team members added yet. Click &quot;+ Add Member&quot; to add employees.</p>
    ) : (
      teamMembers.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between border border-gray-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-medium text-sm shrink-0">
              {m.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{m.name}</p>
              <p className="text-sm text-gray-500">{m.designation}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTeamMembers((prev) => prev.filter((e) => e.id !== m.id))}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
          >
            Remove
          </button>
        </div>
      ))
    )}
  </div>
</div>
{/* FILE ATTACHMENTS SECTION */}
<div className="bg-white rounded-2xl border border-gray-200 p-8 mt-8">
  
  {/* Section Header */}
  <div className="pb-4 border-b">
    <h2 className="text-lg font-semibold text-gray-900">
      File Attachments
    </h2>
  </div>

  {/* Upload Box – same box shows empty state or uploaded previews */}
  <div className="mt-6">
    <input
      ref={fileInputRef}
      type="file"
      multiple
      accept={ACCEPTED_TYPES}
      onChange={handleFileChange}
      className="hidden"
      aria-label="Upload files"
    />
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFilePicker();
        }
      }}
      onClick={openFilePicker}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        flex flex-col min-h-[12rem] rounded-xl border-2 border-dashed cursor-pointer transition-colors p-4
        ${dragActive
          ? "border-green-600 bg-green-100"
          : "border-green-500 bg-green-50 hover:bg-green-100"
        }
      `}
    >
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-sm font-medium text-gray-700">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, DOC, ZIP, or images up to 10MB
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 w-full">
          {files.map((entry, index) => (
            <div
              key={`${entry.file.name}-${index}`}
              className="relative group shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {entry.objectUrl ? (
                <img
                  src={entry.objectUrl}
                  alt={entry.file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-1">
                  <span className="text-2xl">📄</span>
                  <span className="text-[10px] truncate w-full text-center" title={entry.file.name}>
                    {entry.file.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          ))}
          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-green-400 bg-green-50/80 flex flex-col items-center justify-center text-green-700 text-xs shrink-0 pointer-events-none">
            <span className="text-2xl">+</span>
            <span>Add more</span>
          </div>
        </div>
      )}
    </div>

    {uploadError && (
      <p className="mt-2 text-sm text-red-600">{uploadError}</p>
    )}
  </div>
</div>
{/* ACTION BUTTONS */}
<div className="mt-10 pt-6 border-t border-gray-200 flex justify-end gap-4">

  {/* Cancel */}
  <button
    type="button"
    onClick={handleCancel}
    className="
      px-6 py-2.5 rounded-xl border border-gray-300
      text-gray-700 bg-white
      hover:bg-gray-50 transition
    "
  >
    Cancel
  </button>

  {/* Save as Draft */}
  <button
    type="button"
    disabled={isCreating}
    onClick={() => saveProject("Draft")}
    className="
      px-6 py-2.5 rounded-xl border border-gray-300
      text-gray-700 bg-white
      hover:bg-gray-50 transition disabled:opacity-50
    "
  >
    Save as Draft
  </button>

  {/* Create Project */}
  <button
    type="button"
    disabled={isCreating}
    onClick={() => saveProject("Active")}
    className="
      px-6 py-2.5 rounded-xl bg-green-600
      text-white font-medium
      hover:bg-green-700 transition disabled:opacity-50
    "
  >
    {isCreating ? "Creating…" : "Create Project"}
  </button>

</div>

      </div>
    </div>
  );
}