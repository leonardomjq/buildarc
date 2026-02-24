import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="px-6 py-10">
      {/* Perforation divider */}
      <div className="border-t border-dashed border-text-dim/30 mb-8" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="text-text-dim uppercase tracking-widest">End of Arc</div>

        <nav className="flex items-center gap-6 text-text-muted">
          <a
            href="https://github.com/leonardomjq/buildarc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/buildarc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors"
          >
            npm
          </a>
          <Link href="/terms" className="hover:text-text transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-text transition-colors">
            Privacy
          </Link>
        </nav>

        <div className="text-text-dim/50 uppercase tracking-widest text-[10px]">MIT License</div>
      </div>
    </footer>
  );
}
