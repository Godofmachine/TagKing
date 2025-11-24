import LandingNav from "@/components/LandingNav";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-yellow-50 dark:from-gray-900 dark:via-blue-900 dark:to-teal-900">
      <LandingNav />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-yellow-600 bg-clip-text text-transparent mb-4">
            Legal Information
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="space-y-12">
          {/* Terms of Service */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-blue-100 dark:border-blue-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Terms of Service
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                <strong>1. Acceptance of Terms</strong><br />
                By accessing and using TagKing, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p>
                <strong>2. Use License</strong><br />
                Permission is granted to temporarily use TagKing for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
              <p>
                <strong>3. Disclaimer</strong><br />
                The materials on TagKing's website are provided "as is". TagKing makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
              </p>
              <p>
                <strong>4. Limitations</strong><br />
                In no event shall TagKing or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TagKing's website.
              </p>
            </div>
          </section>

          {/* Privacy Policy */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-teal-100 dark:border-teal-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Privacy Policy
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                <strong>1. Information Collection</strong><br />
                We collect information you provide directly to us, such as when you create an account, use our services, or communicate with us. This may include your email address and WhatsApp session data.
              </p>
              <p>
                <strong>2. Use of Information</strong><br />
                We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect TagKing and our users.
              </p>
              <p>
                <strong>3. Data Security</strong><br />
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
              </p>
              <p>
                <strong>4. WhatsApp Data</strong><br />
                We do not store your WhatsApp messages or contacts permanently. Session data is used solely for the purpose of providing the tagging service and is handled securely.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
