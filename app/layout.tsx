import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono, Lora } from "next/font/google";
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

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
});

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://buildarc-ebon.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "buildarc — your build story, recovered",
    template: "%s | buildarc",
  },
  description:
    "One command turns your Claude Code sessions into tweet threads, build journals, and LinkedIn posts. Your build story, recovered.",
  openGraph: {
    title: "buildarc — your build story, recovered",
    description:
      "One command turns your Claude Code sessions into tweet threads, build journals, and LinkedIn posts. Your build story, recovered.",
    url: BASE_URL,
    siteName: "buildarc",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "buildarc — your build story, recovered",
    description:
      "One command turns your Claude Code sessions into tweet threads, build journals, and LinkedIn posts. Your build story, recovered.",
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
      className={`dark ${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} ${lora.variable}`}
    >
      <body className="min-h-screen bg-bg text-text font-sans antialiased">{children}</body>
    </html>
  );
}
