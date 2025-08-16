import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const separatorVariants = cva(
  "shrink-0",
  {
    variants: {
      orientation: {
        horizontal: "h-[1px] w-full",
        vertical: "h-full w-[1px]",
      },
      variant: {
        default: "bg-border",
        brand: "bg-gradient-brand-primary",
        "brand-secondary": "bg-gradient-brand-secondary",
        "brand-accent": "bg-gradient-brand-accent",
        "brand-warm": "bg-brand-warm-orange",
        "brand-teal": "bg-brand-deep-teal",
        dashed: "border-t border-dashed border-border bg-transparent",
        dotted: "border-t border-dotted border-border bg-transparent",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      variant: "default",
    },
  }
)

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(separatorVariants({ orientation, variant, className }))}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export { Separator, separatorVariants }