"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function HeroSection() {
  const { isSignedIn } = useUser();

  return (
    <div className="text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
        Tag Everyone in Your
        <br />
        <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-yellow-600 bg-clip-text text-transparent">WhatsApp Groups</span>
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
        Stop typing everyone's name manually. Tag all group members instantly with the @everyone command.
      </p>
      <Link
        href={isSignedIn ? "/dashboard" : "/sign-up"}
        className="inline-block bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-teal-700 transition shadow-xl"
      >
        {isSignedIn ? "Go to Dashboard" : "Start Tagging for Free"}
      </Link>
    </div>
  );
}
