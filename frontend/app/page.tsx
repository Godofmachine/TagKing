import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // If user is signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">👑 TagKing</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-white hover:text-white/80 transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold hover:bg-white/90 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Tag Everyone in Your
            <br />
            <span className="text-yellow-300">WhatsApp Groups</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Stop typing everyone's name manually. Tag all group members instantly with the @everyone command.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 transition shadow-xl"
          >
            Start Tagging for Free
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Instant Tagging</h3>
            <p className="text-white/80">
              Type @everyone and tag all group members in seconds
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-white mb-2">Admin Only</h3>
            <p className="text-white/80">
              Only group admins can use tagging commands for security
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Real-time Logs</h3>
            <p className="text-white/80">
              Monitor all bot activity with beautiful real-time logs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
