import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import LandingNav from "@/components/LandingNav";
import HeroSection from "@/components/HeroSection";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-yellow-50 dark:from-gray-900 dark:via-blue-900 dark:to-teal-900">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <HeroSection />

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-blue-100 dark:border-blue-900 shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Instant Tagging</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Type @everyone and tag all group members in seconds
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-teal-100 dark:border-teal-900 shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Admin Only</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Only group admins can use tagging commands for security
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-yellow-100 dark:border-yellow-900 shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Real-time Logs</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor all bot activity with beautiful real-time logs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
