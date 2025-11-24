"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

interface ClearHistoryModalProps {
  onClose: () => void;
}

export default function ClearHistoryModal({ onClose }: ClearHistoryModalProps) {
  const { user } = useUser();
  const [selectedOption, setSelectedOption] = useState<"logs" | "sessions" | "both">("logs");
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const sessions = useQuery(
    api.sessions.getUserSessions,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const clearLogs = useMutation(api.logs.clearLogs);
  const deleteAllSessions = useMutation(api.sessions.deleteAllSessions);

  const handleClear = async () => {
    if (!currentUser) return;
    setIsDeleting(true);

    try {
      if (selectedOption === "logs" || selectedOption === "both") {
        await clearLogs({ userId: currentUser._id });
      }

      if (selectedOption === "sessions" || selectedOption === "both") {
        // 1. Stop all backend sessions first
        if (sessions) {
          await Promise.all(
            sessions.map(async (session) => {
              if (session.renderSessionId) {
                try {
                  await fetch(`${BACKEND_URL}/api/session/${session.renderSessionId}`, {
                    method: "DELETE",
                  });
                } catch (e) {
                  console.error(`Failed to stop session ${session.sessionId}`, e);
                }
              }
            })
          );
        }
        // 2. Delete from Convex
        await deleteAllSessions({ userId: currentUser._id });
      }

      onClose();
    } catch (error) {
      console.error("Failed to clear history:", error);
      alert("Failed to clear history. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Clear History</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Select what you want to delete. This action cannot be undone.
        </p>

        <div className="space-y-4 mb-8">
          <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <input
              type="radio"
              name="clearOption"
              value="logs"
              checked={selectedOption === "logs"}
              onChange={(e) => setSelectedOption(e.target.value as any)}
              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="ml-3">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Clear Activity Logs</span>
              <span className="block text-xs text-gray-500">Removes all log entries from the dashboard</span>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <input
              type="radio"
              name="clearOption"
              value="sessions"
              checked={selectedOption === "sessions"}
              onChange={(e) => setSelectedOption(e.target.value as any)}
              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="ml-3">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Delete All Sessions</span>
              <span className="block text-xs text-gray-500">Disconnects and removes all active sessions</span>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <input
              type="radio"
              name="clearOption"
              value="both"
              checked={selectedOption === "both"}
              onChange={(e) => setSelectedOption(e.target.value as any)}
              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="ml-3">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Clear Everything</span>
              <span className="block text-xs text-gray-500">Removes both logs and sessions</span>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleClear}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Clearing..." : "Confirm Clear"}
          </button>
        </div>
      </div>
    </div>
  );
}
