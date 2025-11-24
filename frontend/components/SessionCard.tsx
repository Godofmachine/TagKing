"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import QrCodeModal from "./QrCodeModal";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

interface SessionCardProps {
  session: {
    _id: Id<"sessions">;
    sessionId: string;
    phoneNumber?: string;
    status: string;
    renderSessionId?: string;
    _creationTime: number;
  };
}

export default function SessionCard({ session }: SessionCardProps) {
  const deleteSession = useMutation(api.sessions.deleteSession);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (session.status === "qr" && session.renderSessionId) {
      const fetchQr = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/session/${session.renderSessionId}/qr`);
          if (res.ok) {
            const data = await res.json();
            setQrCode(data.qrDataUrl);
            // Don't auto-open modal here, let user click the button
          } else {
            // If QR is not ready, clear it to avoid showing stale QR
            setQrCode(null);
          }
        } catch (err) {
          console.error("Failed to fetch QR:", err);
          setQrCode(null);
        }
      };
      fetchQr();
      const interval = setInterval(fetchQr, 3000); // Poll every 3s
      return () => clearInterval(interval);
    } else {
      // If status is not 'qr', hide modal and clear qr code
      setShowQr(false);
      setQrCode(null);
    }
  }, [session.status, session.renderSessionId]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this session?")) {
      try {
        if (session.renderSessionId) {
          await fetch(`${BACKEND_URL}/api/session/${session.renderSessionId}`, {
            method: "DELETE",
          });
        }
        await deleteSession({ sessionId: session._id });
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete session");
      }
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
    <>
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

        {/* Debug info - remove later */}
        <div className="text-xs text-gray-400 mb-2">
          Status: {session.status} | ID: {session.sessionId}
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
          {(session.status === "qr" || session.status === "created") && (
            <button
              onClick={() => setShowQr(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              disabled={!qrCode && session.status !== "qr"}
            >
              {qrCode ? "View QR Code" : "Loading QR..."}
            </button>
          )}
          {(session.status === "authenticated" || session.status === "open") && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-default transition text-sm font-medium opacity-90"
              disabled
            >
              Connected
            </button>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQr && qrCode && (
        <QrCodeModal qrCode={qrCode} onClose={() => setShowQr(false)} />
      )}
    </>
  );
}
