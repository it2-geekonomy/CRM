"use client";

type ActivityEntry = {
  id: string;
  userName: string;
  description: React.ReactNode;
  timestamp: string;
};

type ActivityLogModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MOCK_ACTIVITIES: ActivityEntry[] = [
  {
    id: "1",
    userName: "Rajesh Kumar",
    description: (
      <>
        <strong>Rajesh Kumar</strong> marked checklist item as completed
      </>
    ),
    timestamp: "Today at 10:30 AM",
  },
  {
    id: "2",
    userName: "Rajesh Kumar",
    description: (
      <>
        <strong>Rajesh Kumar</strong> uploaded <strong className="text-green-600 hover:underline cursor-pointer">homepage-design-v3.fig</strong>
      </>
    ),
    timestamp: "Yesterday at 04:15 PM",
  },
  {
    id: "3",
    userName: "Arjun Sindhia",
    description: (
      <>
        <strong>Arjun Sindhia</strong> commented: &ldquo;Please ensure the hero section follows the brand guidelines&rdquo;
      </>
    ),
    timestamp: "Feb 16, 2026 at 11:20 AM",
  },
  {
    id: "4",
    userName: "Rajesh Kumar",
    description: (
      <>
        <strong>Rajesh Kumar</strong> changed status from <strong>To Do</strong> to <strong>In Progress</strong>
      </>
    ),
    timestamp: "Feb 15, 2026 at 09:15 AM",
  },
  {
    id: "5",
    userName: "Arjun Sindhia",
    description: (
      <>
        <strong>Arjun Sindhia</strong> assigned task to <strong>Rajesh Kumar</strong>
      </>
    ),
    timestamp: "Feb 10, 2026 at 11:30 AM",
  },
];

export default function ActivityLogModal({ isOpen, onClose }: ActivityLogModalProps) {
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
          <div className="relative">
            <div className="absolute left-[5px] top-3 bottom-3 w-0.5 bg-green-500" aria-hidden />
            {MOCK_ACTIVITIES.map((entry) => (
              <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                <div className="relative z-10 w-3 h-3 shrink-0 rounded-full bg-green-500 mt-0.5" />
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm text-gray-900">{entry.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{entry.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
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
