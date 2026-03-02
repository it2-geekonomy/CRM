"use client";

import React, { useEffect } from "react";

interface LoadingScreenProps {
  appName?: string;
  /** Fired when progress hits 100 — use this to unmount the loader */
  onComplete?: () => void;
}

export default function LoadingScreen({
  onComplete,
}: LoadingScreenProps) {

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      <style>{`
        @keyframes barBounce {
          0%, 100% { height: 12px; opacity: 0.4; }
          50%       { height: 44px; opacity: 1;   }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1;   }
        }
        .loader-fadeup {
          animation: fadeUp 0.6s ease forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      {/* Full-screen dark navy backdrop — matches #1a2235 sidebar */}
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1a2235] px-6"
        role="status"
        aria-label="Loading application"
      >

        {/* ── Centered card ── */}
        <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center text-center">

          {/* Loading animation — staggered bars */}
          <div className="loader-fadeup mb-8 flex items-end justify-center gap-1.5 h-12">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="block w-2 rounded-full bg-green-500"
                style={{
                  animation: `barBounce 1.1s ease-in-out ${i * 0.12}s infinite`,
                  boxShadow: "0 0 8px rgba(34,197,94,0.6)",
                }}
              />
            ))}
          </div>

          {/* Dot row — decorative */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-1.5 h-1.5 rounded-full bg-green-500"
                style={{
                  animation: `pulse-glow 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}