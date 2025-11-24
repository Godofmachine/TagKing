"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function StatsCards() {
  const { user } = useUser();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const stats = useQuery(
    api.stats.getUserStats,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 p-6 shadow-lg hover:shadow-xl transition">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg">
            <span className="text-2xl">📱</span>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats?.activeSessions || 0}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-teal-200 dark:border-teal-700 p-6 shadow-lg hover:shadow-xl transition">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-teal-100 to-green-200 dark:from-teal-900 dark:to-green-800 rounded-lg">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Groups Tagged</p>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {stats?.groupsTagged || 0}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-700 p-6 shadow-lg hover:shadow-xl transition">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Members Reached</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats?.membersReached || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
