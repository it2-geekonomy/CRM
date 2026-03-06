"use client";

import { useGetTaskActivityQuery } from "@/store/api/taskApiSlice";

type ActivityEntry = {
  id: string;
  userName: string;
  description: React.ReactNode;
  timestamp: string;
};

type ActivityLogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
};

function formatTimestamp(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today
      return `Today at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
    } else if (diffDays === 1) {
      // Yesterday
      return `Yesterday at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
    } else if (diffDays < 7) {
      // This week
      return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
    } else {
      // Older
      return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
    }
  } catch {
    return dateStr;
  }
}

function formatStatus(status: string): string {
  // Map backend status to frontend display format
  const statusMap: Record<string, string> = {
    IN_PROGRESS: "In Progress",
    ON_HOLD: "On-Hold",
    REVIEW: "Review",
    ADDRESSED: "Closed",
    OVERDUE: "Overdue",
    OPEN: "Open", // Handle OPEN if it exists in old records
  };
  // If status is already in frontend format, return as-is
  if (["In Progress", "On-Hold", "Closed", "Open", "Review", "Overdue"].includes(status)) {
    return status;
  }
  // Otherwise, map from backend format
  return statusMap[status] || status;
}

export default function ActivityLogModal({ isOpen, onClose, taskId }: ActivityLogModalProps) {
  const { data: activityData, isLoading, isError } = useGetTaskActivityQuery(taskId, {
    skip: !isOpen || !taskId, // Only fetch when modal is open
    refetchOnMountOrArgChange: true,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable activity list with timeline */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">Loading activity log...</p>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-red-500">Failed to load activity log</p>
            </div>
          ) : !activityData || activityData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">No activity recorded yet</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[5px] top-3 bottom-3 w-0.5 bg-green-500" aria-hidden />
              {[...activityData].reverse().map((activity) => {
                const userName = activity.changedBy.name;
                const oldStatus = formatStatus(activity.oldStatus);
                const newStatus = formatStatus(activity.newStatus);
                const description = (
                  <>
                    <strong>{userName}</strong> changed status from <strong>{oldStatus}</strong> to <strong>{newStatus}</strong>
                    {activity.changeReason && (
                      <>
                        <br />
                        <span className="text-gray-600 italic">Reason: {activity.changeReason}</span>
                      </>
                    )}
                  </>
                );
                
                return (
                  <div key={activity.id} className="relative flex gap-4 pb-6 last:pb-0">
                    <div className="relative z-10 w-3 h-3 shrink-0 rounded-full bg-green-500 mt-0.5" />
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm text-gray-900">{description}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimestamp(activity.changedAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
