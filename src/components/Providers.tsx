"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#f5f5f5",
            border: "1px solid #2a2a2a",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#0a0a0a" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#0a0a0a" } },
        }}
      />
    </SessionProvider>
  );
}
