import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TagKing - WhatsApp Group Tagger",
  description: "Tag everyone in your WhatsApp groups with one command",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ConvexClientProvider>
            <div className="flex flex-col min-h-screen">
              <div className="flex-grow">
                {children}
              </div>
              <Footer />
            </div>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
