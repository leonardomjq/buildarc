import Link from "next/link";
import { cn } from "@/lib/utils";

const variantClasses = {
  primary:
    "bg-accent-green text-bg font-medium hover:opacity-90 transition-opacity disabled:opacity-50",
  secondary:
    "bg-surface border border-border hover:bg-surface-elevated transition-colors disabled:opacity-50",
  ghost: "text-text-muted hover:text-text transition-colors",
} as const;

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-6 py-2 text-sm",
  lg: "px-8 py-3 text-lg",
} as const;

const baseClasses =
  "rounded focus-visible:focus-ring inline-flex items-center justify-center gap-2 font-mono";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

export interface ButtonLinkProps
  extends React.ComponentProps<typeof Link> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}
