import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-sm border border-border bg-surface px-3 py-1 text-sm text-ink-900 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink-900 placeholder:text-ink-400 focus-visible:outline-none focus-visible:border-green-600 focus-visible:ring-2 focus-visible:ring-green-100 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
