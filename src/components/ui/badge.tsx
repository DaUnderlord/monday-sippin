import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        
        // Monday Sippin' Brand Variants
        brand:
          "border-transparent bg-brand-deep-teal text-white hover:bg-brand-deep-teal/80",
        "brand-warm":
          "border-transparent bg-brand-warm-orange text-white hover:bg-brand-warm-orange/80",
        "brand-purple":
          "border-transparent bg-brand-rich-purple text-white hover:bg-brand-rich-purple/80",
        "brand-green":
          "border-transparent bg-brand-sage-green text-white hover:bg-brand-sage-green/80",
        "brand-coral":
          "border-transparent bg-brand-coral-pink text-white hover:bg-brand-coral-pink/80",
        "brand-gradient":
          "border-transparent bg-gradient-brand-primary text-white hover:shadow-lg",
        "brand-outline":
          "border-brand-deep-teal text-brand-deep-teal hover:bg-brand-deep-teal hover:text-white",
        "brand-soft":
          "border-transparent bg-brand-deep-teal/10 text-brand-deep-teal hover:bg-brand-deep-teal/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }