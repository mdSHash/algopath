import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://algopath.vercel.app";

const TITLE = "AlgoPath — Logic-First Coding Practice";
const DESCRIPTION =
  "Stop copying solutions. Start thinking. AlgoPath forces you to write your problem-solving logic in plain English before the code editor unlocks. Powered by Gemini.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · AlgoPath",
  },
  description: DESCRIPTION,
  applicationName: "AlgoPath",
  keywords: [
    "coding practice",
    "algorithms",
    "leetcode alternative",
    "AI tutor",
    "logic-first",
    "Gemini",
    "Python",
    "JavaScript",
    "Java",
  ],
  authors: [{ name: "AlgoPath" }],
  creator: "AlgoPath",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "AlgoPath",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "AlgoPath — Logic-first coding practice with AI tutoring",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrains.variable} h-full antialiased dark`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
      >
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
