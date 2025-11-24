import LandingNav from "@/components/LandingNav";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-yellow-50 dark:from-gray-900 dark:via-blue-900 dark:to-teal-900">
      <LandingNav />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-yellow-600 bg-clip-text text-transparent mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to know about using TagKing
          </p>
        </div>

        <div className="space-y-12">
          {/* Getting Started Section */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-blue-100 dark:border-blue-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🚀</span> Getting Started
            </h2>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Create an Account</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Sign up for a free account using your email. You'll be redirected to the dashboard immediately.
                </p>
              </div>
              <div className="border-l-4 border-teal-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. Create a Session</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  In the dashboard, enter a name for your session (e.g., "My Phone") and click "Create Session".
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. Scan QR Code</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  A QR code will appear. Open WhatsApp on your phone, go to Linked Devices &gt; Link a Device, and scan the code.
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-teal-100 dark:border-teal-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">✨</span> Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">📢 Tag Everyone</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Simply type <code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">@everyone</code> in any group where the bot is added to tag all members instantly.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">🔒 Admin Only</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  For security, only group admins can use the tagging command. This prevents spam from regular members.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">📊 Real-time Stats</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Track how many groups you've tagged and members reached directly from your dashboard.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">🗑️ Clear History</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Easily wipe all your session data and logs with the "Clear History" button for complete privacy.
                </p>
              </div>
            </div>
          </section>

          {/* FAQs Section */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-yellow-100 dark:border-yellow-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">❓</span> Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <details className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
                <summary className="font-semibold text-gray-900 dark:text-white list-none flex justify-between items-center">
                  Is TagKing free to use?
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Yes! TagKing is currently free to use for all users.
                </p>
              </details>
              <details className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
                <summary className="font-semibold text-gray-900 dark:text-white list-none flex justify-between items-center">
                  Is it safe to link my WhatsApp?
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Yes. We use the official WhatsApp Web protocol. We do not store your messages or contacts. We only process the groups you use the command in.
                </p>
              </details>
              <details className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
                <summary className="font-semibold text-gray-900 dark:text-white list-none flex justify-between items-center">
                  Why did my session disconnect?
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  WhatsApp Web sessions can disconnect if your phone is offline for too long or if you manually log out from your phone. Simply create a new session to reconnect.
                </p>
              </details>
              <details className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
                <summary className="font-semibold text-gray-900 dark:text-white list-none flex justify-between items-center">
                  How do I delete my data?
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  You can use the "Clear History" button in the dashboard to delete all your sessions and logs from our servers instantly.
                </p>
              </details>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
