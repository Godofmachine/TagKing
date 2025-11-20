"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import SessionCard from "./SessionCard";

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

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !sessionName.trim()) return;

    setIsCreating(true);
    try {
      const sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      await createSession({
        userId: currentUser._id,
        sessionId,
        phoneNumber: sessionName,
      });
      setSessionName("");
      // TODO: Call backend API to actually create WhatsApp session
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Create New Session
        </h2>
        <form onSubmit={handleCreateSession} className="flex gap-4">
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Session name (e.g., My Phone)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={isCreating || !sessionName.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
          >
            {isCreating ? "Creating..." : "Create Session"}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-2">
          Creating a session will generate a QR code to connect your WhatsApp
        </p>
      </div>

      {/* Sessions List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Sessions ({sessions?.length || 0})
        </h2>
        {!sessions || sessions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sessions yet
            </h3>
            <p className="text-gray-600">
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
