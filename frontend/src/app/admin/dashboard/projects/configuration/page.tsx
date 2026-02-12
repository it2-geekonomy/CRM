"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.gif,.webp,image/*";

type FileEntry = { file: File; objectUrl?: string };

const DEFAULT_PROJECT_NAME = "ABC Corp Website Redesign";
const DEFAULT_PROJECT_CODE = "ABC-WEB-001";
const DEFAULT_CLIENT = "ABC Corporation";
const DEFAULT_PROJECT_TYPE = "Website Design & Development";
const DEFAULT_DESCRIPTION = "Complete website redesign including homepage, 5 internal pages, responsive design, and CMS integration.";

export default function ProjectConfigurationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projectName, setProjectName] = useState(DEFAULT_PROJECT_NAME);
  const [projectCode, setProjectCode] = useState(DEFAULT_PROJECT_CODE);
  const [client, setClient] = useState(DEFAULT_CLIENT);
  const [projectType, setProjectType] = useState(DEFAULT_PROJECT_TYPE);
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [startDate, setStartDate] = useState("2026-02-04");
  const [endDate, setEndDate] = useState("2026-05-15");
  const [estimatedHours, setEstimatedHours] = useState(320);
  const [hourlyRate, setHourlyRate] = useState("$150");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const saveProject = (status: "Draft" | "Active") => {
    const newProject = {
      id: Date.now(),
      projectName: projectName.trim() || "Untitled Project",
      projectCode: projectCode.trim(),
      client: client.trim() || DEFAULT_CLIENT,
      projectType: projectType.trim() || DEFAULT_PROJECT_TYPE,
      description: description.trim(),
      status,
      startDate,
      endDate,
      estimatedHours: Number(estimatedHours) || 320,
      hourlyRate: hourlyRate.trim() || "$150",
    };
    const existing = JSON.parse(localStorage.getItem("projects") ?? "[]");
    localStorage.setItem("projects", JSON.stringify([...existing, newProject]));
    router.push("/admin/dashboard/projects");
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
                  onChange={(e) => setProjectType(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="Website Design & Development">Website Design & Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Branding">Branding</option>
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

    {/* Hourly Rate */}
    <div>
      <label className="text-sm font-medium text-gray-700">
        Hourly Rate
      </label>
      <input
        type="text"
        value={hourlyRate}
        onChange={(e) => setHourlyRate(e.target.value)}
        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>

  </div>
</div>
{/* TEAM ASSIGNMENT SECTION */}
<div className="bg-white rounded-2xl border border-gray-200 p-8 mt-8">
  
  {/* Section Header */}
  <div className="flex items-center justify-between pb-4 border-b">
    <h2 className="text-lg font-semibold text-gray-900">
      Team Assignment
    </h2>
    <button className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
      + Add Member
    </button>
  </div>

  {/* Project Manager */}
  <div className="mt-6">
    <label className="text-sm font-medium text-gray-700">
      Project Manager
    </label>
    <select className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-green-500">
      <option>Arjun Sindhia</option>
      <option>Sanketh M</option>
      <option>Sumukh B</option>
    </select>
  </div>

  {/* Team Members */}
  <div className="mt-6 space-y-4">
    <label className="text-sm font-medium text-gray-700">
      Team Members
    </label>

    {/* Member 1 */}
    <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-medium">
          RK
        </div>
        <div>
          <p className="font-medium text-gray-900">
            Rajesh Kumar
          </p>
          <p className="text-sm text-gray-500">
            Lead Designer
          </p>
        </div>
      </div>
      <button className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
        Remove
      </button>
    </div>

    {/* Member 2 */}
    <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
          PD
        </div>
        <div>
          <p className="font-medium text-gray-900">
            Priya Desai
          </p>
          <p className="text-sm text-gray-500">
            Frontend Developer
          </p>
        </div>
      </div>
      <button className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
        Remove
      </button>
    </div>

    {/* Member 3 */}
    <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-medium">
          AV
        </div>
        <div>
          <p className="font-medium text-gray-900">
            Amit Verma
          </p>
          <p className="text-sm text-gray-500">
            Backend Developer
          </p>
        </div>
      </div>
      <button className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
        Remove
      </button>
    </div>
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
    onClick={() => saveProject("Draft")}
    className="
      px-6 py-2.5 rounded-xl border border-gray-300
      text-gray-700 bg-white
      hover:bg-gray-50 transition
    "
  >
    Save as Draft
  </button>

  {/* Create Project */}
  <button
    type="button"
    onClick={() => saveProject("Active")}
    className="
      px-6 py-2.5 rounded-xl bg-green-600
      text-white font-medium
      hover:bg-green-700 transition
    "
  >
    Create Project
  </button>

</div>

      </div>
    </div>
  );
}