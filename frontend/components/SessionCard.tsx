"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface SessionCardProps {
  session: {
    _id: Id<"sessions">;
    sessionId: string;
    phoneNumber?: string;
    status: string;
    _creationTime: number;
  };
}

export default function SessionCard({ session }: SessionCardProps) {
  const deleteSession = useMutation(api.sessions.deleteSession);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this session?")) {
      await deleteSession({ sessionId: session._id });
    }
  };

  const statusColors = {
    created: "bg-gray-100 text-gray-800",
    qr: "bg-yellow-100 text-yellow-800",
    authenticated: "bg-blue-100 text-blue-800",
    open: "bg-green-100 text-green-800",
    closed: "bg-red-100 text-red-800",
  };

  const statusEmoji = {
    created: "⏳",
    qr: "📱",
    authenticated: "✅",
    open: "🟢",
    closed: "🔴",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {session.phoneNumber || session.sessionId}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            ID: {session.sessionId}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[session.status as keyof typeof statusColors] ||
            statusColors.created
          }`}
        >
          {statusEmoji[session.status as keyof typeof statusEmoji] || "⏳"}{" "}
          {session.status}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Created: {new Date(session._creationTime).toLocaleString()}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
        >
          Delete
        </button>
        {session.status === "qr" && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            View QR Code
          </button>
        )}
      </div>
    </div>
  );
}
