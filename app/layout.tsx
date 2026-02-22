import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk, IBM_Plex_Serif } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-serif",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://buildlog.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "buildlog — git log for your AI coding sessions",
    template: "%s | buildlog",
  },
  description:
    "CLI tool that reads Claude Code transcripts and generates build journals and social content. Turn 50 AI coding sessions into a story.",
  openGraph: {
    title: "buildlog — git log for your AI coding sessions",
    description:
      "CLI tool that reads Claude Code transcripts and generates build journals and social content. Turn 50 AI coding sessions into a story.",
    url: BASE_URL,
    siteName: "buildlog",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "buildlog — git log for your AI coding sessions",
    description:
      "CLI tool that reads Claude Code transcripts and generates build journals and social content. Turn 50 AI coding sessions into a story.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${ibmPlexSerif.variable}`}
    >
      <body className="min-h-screen bg-bg text-text font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
