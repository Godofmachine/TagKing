"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function LandingNav() {
  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-white">👑 TagKing</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/sign-in"
              className="text-white hover:text-white/80 transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-white dark:bg-yellow-400 text-blue-600 dark:text-blue-900 px-6 py-2 rounded-full font-semibold hover:bg-white/90 dark:hover:bg-yellow-300 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
