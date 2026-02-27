"use client";

import { Configuration, Department } from "../types";
import ConfigForm from "./ConfigForm";

interface Props {
  department: Department;
  onSubmit: (config: Configuration) => void;
  onClose: () => void;
}

export default function ConfigModal({ department, onSubmit, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* 
        Mobile: slides up from bottom as a sheet (rounded top corners, full width)
        sm+:    centered card with max-width and rounded corners all around
      */}
      <div className="
        bg-white w-full relative
        rounded-t-2xl sm:rounded-2xl
        shadow-xl
        sm:max-w-lg
        max-h-[92vh] sm:max-h-[90vh]
        flex flex-col
        overflow-hidden
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          {/* Mobile drag handle */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full sm:hidden" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Create Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none p-1 -mr-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="px-5 sm:px-7 py-5 sm:py-6 overflow-y-auto flex-1">
          <ConfigForm
            department={department}
            onSubmit={onSubmit}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}