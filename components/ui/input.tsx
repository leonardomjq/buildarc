import { cn } from "@/lib/utils";

const inputClasses =
  "w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent-green/40 transition-colors";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({ icon, className, ref, ...props }: InputProps) {
  if (icon) {
    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </div>
        <input
          ref={ref}
          className={cn(inputClasses, "pl-10", className)}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      ref={ref}
      className={cn(inputClasses, className)}
      {...props}
    />
  );
}
