import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import Providers from "./providers";
import { RealTimeProvider } from "@/lib/real-time-context";
import { Toaster } from "@/components/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamFirst - Football Club Donations",
  description: "Support your favorite football clubs with blockchain-powered donations",
  generator: "v0.app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <RealTimeProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster />
          </RealTimeProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
