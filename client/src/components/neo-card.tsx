import { cn } from "../lib/utils"
import { type HTMLAttributes, forwardRef } from "react"

interface NeoCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "accent"
}

const NeoCard = forwardRef<HTMLDivElement, NeoCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-card text-card-foreground",
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      accent: "bg-accent text-accent-foreground",
    }

    return (
      <div
        ref={ref}
        className={cn("border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6", variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)

NeoCard.displayName = "NeoCard"

export { NeoCard }
