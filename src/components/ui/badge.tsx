import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-mono font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-green-700 text-white shadow-sm hover:bg-green-600",
        secondary: "border-transparent bg-green-100 text-green-900 hover:bg-green-100/80",
        destructive: "border-transparent bg-danger text-white shadow-sm hover:bg-danger/90",
        warning: "border-transparent bg-amber-500 text-ink-900 shadow-sm hover:bg-amber-600",
        outline: "border-border text-ink-600 bg-bg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
