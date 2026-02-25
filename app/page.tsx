import { GhostThreadHero } from "@/components/landing/ghost-thread-hero";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ThreadLine } from "@/components/landing/thread-line";
import { Logo } from "@/components/logo";
import { Github } from "lucide-react";
import dynamic from "next/dynamic";

const BuildGap = dynamic(() => import("@/components/landing/build-gap").then((m) => m.BuildGap));
const OutputShowcase = dynamic(() =>
  import("@/components/landing/output-showcase").then((m) => m.OutputShowcase),
);
const OriginCaseStudy = dynamic(() =>
  import("@/components/landing/origin-case-study").then((m) => m.OriginCaseStudy),
);
const CommandBlock = dynamic(() =>
  import("@/components/landing/command-block").then((m) => m.CommandBlock),
);
const StickyCta = dynamic(() =>
  import("@/components/landing/sticky-cta").then((m) => m.StickyCta),
);

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen flex flex-col bg-bg overflow-x-hidden">
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-bg/80 backdrop-blur-md border-b border-text-dim/20">
        <Logo size="sm" href="/" />
        <nav className="flex items-center gap-4">
          <a
            href="https://github.com/leonardomjq/buildarc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-text transition-colors"
          >
            <Github className="size-3.5" />
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/buildarc"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-muted hover:text-text transition-colors"
          >
            npm
          </a>
        </nav>
      </header>

      <ThreadLine>
        <GhostThreadHero />
        <BuildGap />
        <OutputShowcase />
        <OriginCaseStudy />
        <CommandBlock />
      </ThreadLine>

      <LandingFooter />
      <StickyCta />
    </div>
  );
}
