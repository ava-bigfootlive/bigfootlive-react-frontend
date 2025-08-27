import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "btn-primary shadow-md hover:shadow-lg",
        destructive:
          "status-error shadow-md hover:shadow-lg focus-visible:ring-red-500/30",
        outline:
          "btn-secondary shadow-sm hover:shadow-md",
        secondary:
          "bg-[hsl(var(--surface-elevated))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-sm hover:shadow-md hover:bg-[hsl(var(--surface-overlay))]",
        ghost:
          "text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--surface-elevated))] hover:text-[hsl(var(--foreground))]",
        link: "text-[hsl(var(--brand-primary))] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3 rounded-lg",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 rounded-md",
        lg: "h-12 px-6 has-[>svg]:px-4 rounded-lg text-base",
        icon: "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
