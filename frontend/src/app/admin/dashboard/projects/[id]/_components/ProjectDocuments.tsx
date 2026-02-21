"use client";

import { useRef } from "react";

export default function ProjectDocuments() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // TODO: integrate with backend API when ready
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Project Documents</h2>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.fig,.sketch"
        />
        <button
          type="button"
          onClick={handleUploadClick}
          className="px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 font-medium"
        >
          + Upload File
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center">
        <p className="text-lg font-semibold text-gray-900 mb-2">No documents yet</p>
        <p className="text-gray-500">
          Briefs, SOWs, design files and handoff docs will appear here once uploaded.
        </p>
      </div>
    </div>
  );
}
