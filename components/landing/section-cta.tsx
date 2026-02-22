import Link from "next/link";

interface SectionCtaProps {
  text: string;
  href?: string;
  variant?: "primary" | "secondary";
}

export function SectionCta({
  text,
  href = "/signup",
  variant = "primary",
}: SectionCtaProps) {
  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-1 font-mono text-sm text-accent-green border-b border-accent-green/50 pb-0.5 hover:border-accent-green transition-colors"
      >
        {text}
        <span aria-hidden>&rarr;</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center font-mono text-sm font-medium bg-accent-green text-[#0A0A0A] px-6 py-2.5 rounded hover:opacity-90 transition-opacity"
    >
      {text}
    </Link>
  );
}
