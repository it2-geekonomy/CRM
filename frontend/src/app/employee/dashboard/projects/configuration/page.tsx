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

export default function EmployeeProjectConfigurationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projectName, setProjectName] = useState("");
  const [projectCode, setProjectCode] = useState(DEFAULT_PROJECT_CODE);
  const [client, setClient] = useState(DEFAULT_CLIENT);
  const [projectType, setProjectType] = useState(DEFAULT_PROJECT_TYPE);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("2026-02-04");
  const [endDate, setEndDate] = useState("2026-05-15");
  const [estimatedHours, setEstimatedHours] = useState(320);
  const [hourlyRate, setHourlyRate] = useState("$150");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const openFilePicker = () => fileInputRef.current?.click();

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE_BYTES) return `${file.name} exceeds ${MAX_FILE_SIZE_MB}MB`;
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
      else toAdd.push({ file, objectUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined });
    }
    if (errors.length) setUploadError(errors[0]);
    if (toAdd.length) setFiles((prev) => [...prev, ...toAdd]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
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
    router.push("/employee/dashboard/projects");
  };

  const handleCancel = () => router.push("/employee/dashboard/projects");

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Project Configuration</h1>
          <p className="text-gray-500 mt-2">Set up and manage your project settings, team members, and deliverables</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <span className="px-3 py-1 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700">Draft</span>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Project Name <span className="text-red-500">*</span></label>
              <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#69AE44] outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Project Code</label>
              <input type="text" value={projectCode} onChange={(e) => setProjectCode(e.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#69AE44] outline-none" />
              <p className="text-xs text-gray-400 mt-1">Auto-generated if left blank</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Client <span className="text-red-500">*</span></label>
              <select value={client} onChange={(e) => setClient(e.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#69AE44]">
                <option value="ABC Corporation">ABC Corporation</option>
                <option value="XYZ Corp">XYZ Corp</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Project Type</label>
              <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#69AE44]">
                <option value="Website Design & Development">Website Design & Development</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Branding">Branding</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Project Description</label>
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#69AE44] outline-none resize-none" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mt-8">
          <div className="pb-4 border-b"><h2 className="text-lg font-semibold text-gray-900">Timeline</h2></div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Start Date <span className="text-red-500">*</span></label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#69AE44] outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">End Date <span className="text-red-500">*</span></label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#69AE44] outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Estimated Hours</label>
              <input type="number" value={estimatedHours} onChange={(e) => setEstimatedHours(Number(e.target.value) || 0)} className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#69AE44] outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Hourly Rate</label>
              <input type="text" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#69AE44] outline-none" />
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end gap-4">
          <button type="button" onClick={handleCancel} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={() => saveProject("Draft")} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">Save as Draft</button>
          <button type="button" onClick={() => saveProject("Active")} className="px-6 py-2.5 rounded-xl bg-[#69AE44] text-white font-medium hover:bg-[#5a9a3a]">Create Project</button>
        </div>
      </div>
    </div>
  );
}
