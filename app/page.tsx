import { Github } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThreadLine } from "@/components/landing/thread-line";
import { GhostThreadHero } from "@/components/landing/ghost-thread-hero";
import { BuildGap } from "@/components/landing/build-gap";
import { OutputShowcase } from "@/components/landing/output-showcase";
import { OriginCaseStudy } from "@/components/landing/origin-case-study";
import { CommandBlock } from "@/components/landing/command-block";
import { LandingFooter } from "@/components/landing/landing-footer";
import { StickyCta } from "@/components/landing/sticky-cta";

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
