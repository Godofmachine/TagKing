"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import SessionManager from "@/components/SessionManager";
import ActivityLog from "@/components/ActivityLog";
import StatsCards from "@/components/StatsCards";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  if (isLoaded && !user) {
    redirect("/sign-in");
  }

  if (!isLoaded) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-yellow-600 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              Manage your WhatsApp sessions and monitor bot activity
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          <SessionManager />
          <ActivityLog />
        </div>
      </div>
    </DashboardLayout>
  );
}
