import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <Logo size="sm" href="/" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">{children}</main>
    </div>
  );
}
