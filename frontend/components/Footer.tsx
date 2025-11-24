"use client";

import { useState } from "react";

export default function Footer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "ad1363bd-b83b-4595-b733-c0ceb046086b",
          name: name,
          email: email,
          message: message,
          subject: "New Contact Form Submission from TagKing",
          from_name: "TagKing Contact Form",
          website: "TagKing", // Hidden website name value
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("sent");
        setName("");
        setEmail("");
        setMessage("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Brand & Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-yellow-600 bg-clip-text text-transparent">
                  TagKing
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                The ultimate WhatsApp group management tool. Tag everyone instantly, manage groups securely, and track activity with ease.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Built with ❤️ by <a href="https://blueking.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-teal-400 hover:underline font-medium">BlueKing</a>
                </div>
                <div className="flex items-center gap-3">
                  <a href="https://github.com/Godofmachine" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
                    <span className="sr-only">GitHub</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://x.com/Blueking_I" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">More Tools:</span>
                <a href="https://blueking-bionic-converter.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-teal-400 transition">Bionic Converter</a>
                <a href="https://blueking-harmony.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-teal-400 transition">Harmony</a>
                <a href="https://blueking-tempmail.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-teal-400 transition">Temp Mail</a>
              </div>

              <a
                href="https://buymeacoffee.com/blueking"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-gray-900 rounded-lg font-medium transition shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.216 6.415l-.132-.666c-.119-.596-.385-1.174-1.005-1.422-2.19-.877-6.075-.558-9.025-.558-3.248 0-6.329-.197-8.383.757-.665.309-.943.915-1.053 1.552l-.16 1.046c-.21 1.367.093 2.726.85 3.876.71 1.08 1.75 1.86 2.98 2.253.37.875.99 1.63 1.82 2.166 1.25.808 2.78 1.07 4.27 1.07 1.5 0 3.03-.263 4.28-1.07.84-.54 1.46-1.3 1.83-2.18 1.22-.4 2.25-1.18 2.96-2.25.75-1.15 1.05-2.5.84-3.86zm-1.36 3.3c-.48.72-1.15 1.24-1.95 1.5-.25-1.55-.5-3.15-.75-4.75.93.1 1.9.32 2.5.9.4.38.56.9.46 1.56-.09.58-.34 1.1-.66 1.56l.4.23zM12 16.4c-1.1 0-2.2-.2-3.1-.75-.55-.35-.95-.85-1.2-1.4.55.2 1.15.3 1.75.3 1.75 0 3.5-.3 5.15-.85.25.55.65 1.05 1.2 1.4-.9.55-2 .75-3.1.75-.25 0-.5 0-.75-.05z"/>
                </svg>
                Buy me a coffee
              </a>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-500">
              &copy; {new Date().getFullYear()} TagKing. All rights reserved.
            </div>
          </div>

          {/* Mini Contact Form */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <textarea
                  placeholder="How can we help?"
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={status === "sending" || status === "sent"}
                className={`w-full py-2 rounded-lg font-medium text-white transition ${
                  status === "sent"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                }`}
              >
                {status === "sending" ? "Sending..." : status === "sent" ? "Message Sent!" : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
