import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const typographyVariants = cva(
  "font-sans",
  {
    variants: {
      variant: {
        // Headings
        h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-brand-deep-teal",
        h2: "scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl text-brand-deep-teal",
        h3: "scroll-m-20 text-2xl font-semibold tracking-tight text-brand-rich-purple",
        h4: "scroll-m-20 text-xl font-semibold tracking-tight text-brand-rich-purple",
        h5: "scroll-m-20 text-lg font-medium tracking-tight text-brand-deep-teal",
        h6: "scroll-m-20 text-base font-medium tracking-tight text-brand-deep-teal",
        
        // Body text
        body: "text-base font-normal leading-7 text-gray-700",
        "body-large": "text-lg font-normal leading-8 text-gray-700",
        "body-small": "text-sm font-normal leading-6 text-gray-600",
        
        // Special variants
        lead: "text-xl font-medium text-muted-foreground leading-8",
        quote: "mt-6 border-l-2 border-brand-warm-orange pl-6 italic text-gray-700",
        code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        
        // Brand-specific variants
        "brand-heading": "font-extrabold text-brand-deep-teal",
        "brand-subheading": "font-semibold text-brand-rich-purple",
        "brand-accent": "font-medium text-brand-warm-orange",
        "brand-gradient": "bg-gradient-to-r from-brand-deep-teal to-brand-warm-orange bg-clip-text text-transparent font-bold",
        "brand-gradient-secondary": "bg-gradient-to-r from-brand-rich-purple to-brand-coral-pink bg-clip-text text-transparent font-bold",
        
        // Utility variants
        muted: "text-sm text-muted-foreground",
        small: "text-sm font-medium leading-none",
        large: "text-lg font-semibold",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify",
      },
    },
    defaultVariants: {
      variant: "body",
      align: "left",
    },
  }
)

interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: keyof React.JSX.IntrinsicElements
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, align, as, ...props }, ref) => {
    // Map variants to appropriate HTML elements
    const getDefaultElement = (variant: string | null | undefined): keyof React.JSX.IntrinsicElements => {
      switch (variant) {
        case "h1":
          return "h1"
        case "h2":
          return "h2"
        case "h3":
          return "h3"
        case "h4":
          return "h4"
        case "h5":
          return "h5"
        case "h6":
          return "h6"
        case "quote":
          return "blockquote"
        case "code":
          return "code"
        case "lead":
          return "p"
        default:
          return "p"
      }
    }

    const Component = as || getDefaultElement(variant)

    return React.createElement(Component, {
      className: cn(typographyVariants({ variant, align, className })),
      ref,
      ...props,
    })
  }
)

Typography.displayName = "Typography"

export { Typography, typographyVariants }