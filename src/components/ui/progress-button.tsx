import * as React from "react"
import { Button, buttonVariants } from "./button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { type VariantProps } from "class-variance-authority"

interface ProgressButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean
  progress?: number
  loadingText?: string
  barberPole?: boolean
  asChild?: boolean
}

const ProgressButton = React.forwardRef<HTMLButtonElement, ProgressButtonProps>(
  ({ 
    className, 
    children, 
    loading = false, 
    progress, 
    loadingText, 
    barberPole = false,
    disabled,
    variant,
    size,
    asChild,
    ...props 
  }, ref) => {
    return (
      <div className="relative inline-block">
        <Button
          ref={ref}
          className={cn("relative overflow-hidden", className)}
          disabled={disabled || loading}
          variant={variant}
          size={size}
          asChild={asChild}
          {...props}
        >
          {/* Progress bar background */}
          {loading && progress !== undefined && progress > 0 && (
            <div
              className="absolute inset-0 bg-primary/20 transition-all duration-300 ease-out"
              style={{ 
                width: `${Math.min(100, Math.max(0, progress))}%`,
                left: 0
              }}
            />
          )}
          
          {/* Barber pole animation */}
          {loading && barberPole && !progress && (
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer"
                style={{
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
          )}
          
          {/* Button content */}
          <span className="relative flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading && loadingText ? loadingText : children}
            {loading && progress !== undefined && (
              <span className="ml-2 text-xs">
                {Math.round(progress)}%
              </span>
            )}
          </span>
        </Button>
      </div>
    )
  }
)

ProgressButton.displayName = "ProgressButton"

export { ProgressButton }