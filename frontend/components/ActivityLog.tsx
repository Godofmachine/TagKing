"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function ActivityLog() {
  const { user } = useUser();

  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id || "",
  });
  const logs = useQuery(
    api.logs.getRecentLogs,
    currentUser ? { userId: currentUser._id, limit: 50 } : "skip"
  );

  const levelColors = {
    info: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700",
    warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700",
    error: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700",
  };

  const levelEmoji = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-teal-200 dark:border-teal-700 shadow-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
          Activity Log ({logs?.length || 0})
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
        {!logs || logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No activity yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your bot activity will appear here in real-time
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
              <div className="flex items-start gap-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${
                    levelColors[log.level as keyof typeof levelColors] ||
                    levelColors.info
                  }`}
                >
                  {levelEmoji[log.level as keyof typeof levelEmoji] || "ℹ️"}{" "}
                  {log.level}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {log.action}
                  </p>
                  {log.details && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                      {log.details.groupName && (
                        <div>Group: {log.details.groupName}</div>
                      )}
                      {log.details.memberCount !== undefined && (
                        <div>Members: {log.details.memberCount}</div>
                      )}
                      {log.details.message && (
                        <div>Message: {log.details.message}</div>
                      )}
                      {log.details.error && (
                        <div className="text-red-600">
                          Error: {log.details.error}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
