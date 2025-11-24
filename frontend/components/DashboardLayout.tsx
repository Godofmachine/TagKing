"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-yellow-50 dark:from-gray-900 dark:via-blue-900 dark:to-teal-900">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/favicon.ico" alt="TagKing Logo" width={32} height={32} />
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-yellow-600 bg-clip-text text-transparent">TagKing</span>
              </Link>
              
              {/* Desktop Links */}
              <div className="hidden sm:flex items-center gap-8">
                <Link
                  href="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 font-medium transition"
                >
                  Home
                </Link>
                <Link
                  href="/help"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 font-medium transition"
                >
                  Help
                </Link>
                <Link
                  href="/legal"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 font-medium transition"
                >
                  Legal
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/help"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Help
              </Link>
              <Link
                href="/legal"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Legal
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
