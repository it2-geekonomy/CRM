"use client";

import { useState, useCallback, useEffect } from "react";

export type AddTimestampData = {
  date: string;
  hours: number;
  minutes: number;
  notes: string;
};

type AddTimestampModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: AddTimestampData) => void;
};

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AddTimestampModal({ isOpen, onClose, onAdd }: AddTimestampModalProps) {
  const [date, setDate] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDate(toDateString(new Date()));
      setHours(0);
      setMinutes(0);
      setNotes("");
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setDate("");
    setHours(0);
    setMinutes(0);
    setNotes("");
    onClose();
  }, [onClose]);

  const handleAdd = useCallback(() => {
    const dateVal = date.trim();
    if (!dateVal) return;
    onAdd({
      date: dateVal,
      hours: Math.max(0, Math.min(999, hours)),
      minutes: Math.max(0, Math.min(59, minutes)),
      notes: notes.trim(),
    });
    handleClose();
  }, [date, hours, minutes, notes, onAdd, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        onKeyDown={(e) => e.key === "Escape" && handleClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between shrink-0 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Timestamp</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label htmlFor="add-ts-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              id="add-ts-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="add-ts-hours" className="sr-only">Hours</label>
                <input
                  id="add-ts-hours"
                  type="number"
                  min={0}
                  max={999}
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                />
                <span className="block text-xs text-gray-500 mt-0.5">Hours</span>
              </div>
              <span className="text-gray-400 font-medium pt-5">:</span>
              <div className="flex-1">
                <label htmlFor="add-ts-minutes" className="sr-only">Minutes</label>
                <input
                  id="add-ts-minutes"
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                />
                <span className="block text-xs text-gray-500 mt-0.5">Minutes</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="add-ts-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="add-ts-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm resize-none"
            />
          </div>
        </div>

        <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
