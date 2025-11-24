"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
let convex: ConvexReactClient | null = null;
if (convexUrl) {
  convex = new ConvexReactClient(convexUrl);
}

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!convex) {
    // If no Convex URL is provided, avoid rendering the provider so the app
    // doesn't crash during local development. Feature-dependent components
    // should handle missing data gracefully.
    // eslint-disable-next-line no-console
    console.warn('[Convex] NEXT_PUBLIC_CONVEX_URL not set — Convex disabled');
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
