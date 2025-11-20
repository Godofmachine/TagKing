"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <span className="text-xl font-bold text-gray-900">TagKing</span>
              </Link>
              <div className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/sessions"
                  className="text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  Sessions
                </Link>
                <Link
                  href="/dashboard/logs"
                  className="text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  Activity Logs
                </Link>
              </div>
            </div>
            <UserButton afterSignOutUrl="/" />
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
