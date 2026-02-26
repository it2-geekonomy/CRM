"use client";

import { useState } from "react";
import { Department, ConfigFormData, Configuration } from "../types";

interface Props {
  department: Department;
  onSubmit: (config: Configuration) => void;
  onClose: () => void;
}

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 " +
  "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent " +
  "bg-white placeholder-gray-400";

const selectClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 " +
  "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent " +
  "bg-white appearance-none cursor-pointer pr-8";

const labelClass = "block text-sm font-semibold text-gray-800 mb-1.5";

export default function ConfigForm({ department, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<ConfigFormData>({
    name: "",
    description: "",
    departmentId: department.id,
    billable: false,
    slaHours: "",
    status: "Active",
    tasks: "",
  });

  const handleChange = (key: keyof ConfigFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({
      id: Date.now().toString(),
      name: form.name,
      description: form.description,
      billable: form.billable,
      slaHours: form.slaHours,
      status: form.status,
      tasks: form.tasks,
    });
    onClose();
  };

  const ChevronDown = () => (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Name */}
      <div>
        <label className={labelClass}>
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="Configuration name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          rows={3}
          className={inputClass}
          placeholder="Describe this configuration..."
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      {/* Department (readonly) */}
      <div>
        <label className={labelClass}>Department</label>
        <input
          disabled
          value={department.name}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
        />
      </div>

      {/* SLA Hours + Status — stacked on xs, side-by-side on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className={labelClass}>SLA Hours</label>
          <input
            type="number"
            className={inputClass}
            placeholder="e.g. 24"
            value={form.slaHours}
            onChange={(e) => handleChange("slaHours", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <div className="relative">
            <select
              className={selectClass}
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value as "Active" | "Inactive")}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div>
        <label className={labelClass}>Tasks</label>
        <input
          type="text"
          className={inputClass}
          placeholder="e.g. Call, Email, Follow-up"
          value={form.tasks}
          onChange={(e) => handleChange("tasks", e.target.value)}
        />
      </div>

      {/* Billable toggle */}
      <div className="flex items-center justify-between py-1">
        <label className="text-sm font-semibold text-gray-800">Billable</label>
        <button
          type="button"
          onClick={() => handleChange("billable", !form.billable)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 ${
            form.billable ? "bg-green-500" : "bg-gray-200"
          }`}
          role="switch"
          aria-checked={form.billable}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
              form.billable ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Action Buttons — full-width stacked on xs, right-aligned row on sm+ */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Create
        </button>
      </div>
    </div>
  );
}