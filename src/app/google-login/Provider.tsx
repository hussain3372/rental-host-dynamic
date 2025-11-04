"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Session } from "next-auth"; // ✅ Import Session type

interface ProvidersProps {
  children: ReactNode;
  session?: Session | null; // ✅ Fix: Use proper Session type
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}