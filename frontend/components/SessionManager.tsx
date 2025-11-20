"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import SessionCard from "./SessionCard";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export default function SessionManager() {
  const { user } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [sessionName, setSessionName] = useState("");

  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id || "",
  });
  const sessions = useQuery(
    api.sessions.getUserSessions,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const createSession = useMutation(api.sessions.createSession);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sessionName.trim()) return;

    setIsCreating(true);
    try {
      // Ensure user exists in Convex
      const convexUserId = await getOrCreateUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || user.username || "User",
      });

      // Create session in backend
      const backendRes = await fetch(`${BACKEND_URL}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: convexUserId }),
      });

      if (!backendRes.ok) throw new Error("Backend session creation failed");
      const { id: renderSessionId } = await backendRes.json();

      // Create session in Convex
      await createSession({
        userId: convexUserId,
        sessionId: renderSessionId,
        phoneNumber: sessionName,
      });

      setSessionName("");
      alert("Session created! Scan the QR code in WhatsApp.");
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Session Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 p-6 shadow-lg">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Create New Session
        </h2>
        <form onSubmit={handleCreateSession} className="flex gap-4">
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Session name (e.g., My Phone)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-teal-500"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={isCreating || !sessionName.trim()}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition font-medium shadow-md"
          >
            {isCreating ? "Creating..." : "Create Session"}
          </button>
        </form>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Creating a session will generate a QR code to connect your WhatsApp
        </p>
      </div>

      {/* Sessions List */}
      <div>
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Your Sessions ({sessions?.length || 0})
        </h2>
        {!sessions || sessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No sessions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create your first session to start tagging group members
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sessions.map((session) => (
              <SessionCard key={session._id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
