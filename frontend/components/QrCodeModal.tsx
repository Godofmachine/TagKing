"use client";

import { useEffect } from "react";

interface QrCodeModalProps {
  qrCode: string;
  onClose: () => void;
}

export default function QrCodeModal({ qrCode, onClose }: QrCodeModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scan with WhatsApp</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Open WhatsApp on your phone and scan the QR code to connect your session.
          </p>
          <div className="relative w-64 h-64 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            {qrCode ? (
              <img
                src={qrCode}
                alt="WhatsApp QR Code"
                className="rounded-lg w-full h-full object-contain"
              />
            ) : (
              <div className="text-gray-500">Loading QR...</div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
