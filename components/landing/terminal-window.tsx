import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TerminalWindowProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function TerminalWindow({ title = "Terminal", children, className }: TerminalWindowProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface overflow-hidden", className)}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-elevated/50">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-accent-red/60" />
          <div className="size-2.5 rounded-full bg-accent-amber/60" />
          <div className="size-2.5 rounded-full bg-accent-green/60" />
        </div>
        <span className="font-mono text-[10px] text-text-dim ml-2">{title}</span>
      </div>
      {/* Body with scanline overlay */}
      <div className="relative">
        <div className="p-4 font-mono text-sm">{children}</div>
        <div className="absolute inset-0 texture-scanlines pointer-events-none" />
      </div>
    </div>
  );
}
