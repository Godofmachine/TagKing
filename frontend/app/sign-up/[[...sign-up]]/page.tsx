import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-yellow-50 dark:from-gray-900 dark:via-blue-900 dark:to-teal-900 py-12 px-4 sm:px-6 lg:px-8 relative">
      <Link href="/" className="absolute top-4 left-4 sm:top-8 sm:left-8 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 flex items-center gap-2 transition font-medium">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Home
      </Link>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-yellow-600 bg-clip-text text-transparent mb-2">
            Join TagKing
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Create an account to get started
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              variables: {
                colorPrimary: "#2563eb", // blue-600
                colorText: "#1f2937",
                colorTextSecondary: "#4b5563",
                colorBackground: "#ffffff",
                colorInputBackground: "#f3f4f6",
                colorInputText: "#1f2937",
                borderRadius: "0.5rem",
              },
              elements: {
                rootBox: "w-full",
                card: "shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary: "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white transition shadow-md",
                footerActionLink: "hidden",
                footer: "hidden",
                developmentBadge: "hidden",
                formFieldInput: "border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-teal-500",
                formFieldLabel: "text-gray-700 dark:text-gray-300",
                identityPreviewText: "text-gray-700 dark:text-gray-300",
                identityPreviewEditButton: "text-blue-600 hover:text-blue-700 dark:text-teal-400 dark:hover:text-teal-300",
              }
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
          />
        </div>
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500 dark:text-teal-400 dark:hover:text-teal-300 transition">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
