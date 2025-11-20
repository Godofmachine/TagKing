import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import SessionManager from "@/components/SessionManager";
import ActivityLog from "@/components/ActivityLog";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-yellow-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            Manage your WhatsApp sessions and monitor bot activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 p-6 shadow-lg hover:shadow-xl transition">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</p>
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
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">0</p>
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
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          <SessionManager />
          <ActivityLog />
        </div>
      </div>
    </DashboardLayout>
  );
}
