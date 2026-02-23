"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyCommand() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText("npx buildarc");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-3 bg-surface border border-border rounded px-4 py-2.5 group hover:border-accent-green/50 transition-colors cursor-pointer"
    >
      <span className="font-mono text-sm text-text-muted">
        $ <span className="text-text">npx buildarc</span>
      </span>
      {copied ? (
        <Check className="size-4 text-accent-green" />
      ) : (
        <Copy className="size-4 text-text-dim group-hover:text-text-muted transition-colors" />
      )}
    </button>
  );
}
