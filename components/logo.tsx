import Link from "next/link";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "text-xs",
  md: "text-sm",
} as const;

interface LogoProps {
  size?: keyof typeof sizeClasses;
  href?: string;
  className?: string;
}

export function Logo({ size = "sm", href, className }: LogoProps) {
  const inner = (
    <span
      className={cn(
        "font-mono uppercase tracking-widest text-text",
        sizeClasses[size],
        className
      )}
    >
      build<span className="text-text-dim">log</span>
    </span>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }

  return inner;
}
