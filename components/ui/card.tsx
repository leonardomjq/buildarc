import { cn } from "@/lib/utils";

const variantClasses = {
  default: "bg-surface border border-border",
  glass: "bg-surface-glass backdrop-blur-xl border border-border",
} as const;

const paddingClasses = {
  compact: "p-4",
  default: "p-5",
  spacious: "p-6",
} as const;

const baseClasses = "rounded-lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantClasses;
  padding?: keyof typeof paddingClasses;
  ref?: React.Ref<HTMLDivElement>;
}

export function Card({
  variant = "default",
  padding = "default",
  className,
  ref,
  ...props
}: CardProps) {
  return (
    <div
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], paddingClasses[padding], className)}
      {...props}
    />
  );
}
