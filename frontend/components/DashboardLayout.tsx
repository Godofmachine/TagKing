"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-yellow-50 dark:from-gray-900 dark:via-blue-900 dark:to-teal-900">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-yellow-600 bg-clip-text text-transparent">TagKing</span>
              </Link>
              <div className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/sessions"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 font-medium transition"
                >
                  Sessions
                </Link>
                <Link
                  href="/dashboard/logs"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 font-medium transition"
                >
                  Activity Logs
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
