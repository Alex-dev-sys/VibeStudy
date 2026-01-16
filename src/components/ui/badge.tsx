import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-xl border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground border-border/50",
      },
      // Legacy 'tone' prop support for backward compatibility
      tone: {
        accent: "border-primary/30 bg-primary/20 text-primary",
        neutral: "border-border/50 bg-secondary/50 text-muted-foreground",
        soft: "border-border/30 bg-muted/50 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, tone, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, tone }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

