import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-200" +
  " hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary-border shadow-sm hover:shadow-md relative overflow-hidden group",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive-border shadow-sm hover:shadow-md",
        outline:
          " border [border-color:var(--button-outline)] shadow-xs hover:bg-accent hover:text-accent-foreground active:shadow-none ",
        secondary: "border bg-secondary text-secondary-foreground border border-secondary-border shadow-sm hover:shadow-md",
        ghost: "border border-transparent hover:bg-accent hover:text-accent-foreground",
        gradient: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg hover:shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500",
      },
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

interface RippleProps {
  x: number;
  y: number;
  id: number;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  withMotion?: boolean
  withRipple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, withMotion = true, withRipple = true, onClick, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<RippleProps[]>([]);
    const Comp = asChild ? Slot : "button"
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (withRipple && !asChild) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newRipple = { x, y, id: Date.now() };
        setRipples(prev => [...prev, newRipple]);
        
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
      }
      onClick?.(e);
    };
    
    if (withMotion && !asChild) {
      const { onAnimationStart, onAnimationEnd, onDrag, onDragStart, onDragEnd, ...motionSafeProps } = props;
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          onClick={handleClick}
          {...motionSafeProps}
        >
          {/* Ripple effects */}
          <AnimatePresence>
            {ripples.map(ripple => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute rounded-full bg-white/30 pointer-events-none"
                style={{
                  left: ripple.x - 10,
                  top: ripple.y - 10,
                  width: 20,
                  height: 20,
                }}
              />
            ))}
          </AnimatePresence>
          
          {/* Shimmer effect for default variant */}
          {(variant === "default" || variant === "gradient" || !variant) && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
          )}
          
          <span className="relative z-10 flex items-center justify-center gap-2">
            {props.children}
          </span>
        </motion.button>
      )
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effects for non-motion buttons */}
        {withRipple && !asChild && (
          <AnimatePresence>
            {ripples.map(ripple => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute rounded-full bg-white/30 pointer-events-none"
                style={{
                  left: ripple.x - 10,
                  top: ripple.y - 10,
                  width: 20,
                  height: 20,
                }}
              />
            ))}
          </AnimatePresence>
        )}
        
        {!asChild && (variant === "default" || !variant) && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
        )}
        {!asChild ? (
          <span className="relative z-10 flex items-center justify-center gap-2">
            {props.children}
          </span>
        ) : (
          props.children
        )}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

