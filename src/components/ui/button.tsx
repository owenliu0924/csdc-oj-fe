"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { springSnappy } from "@/lib/motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium cursor-pointer select-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-ring)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {

        default:
          "rounded-xl bg-[var(--pink)] text-[var(--pink-fg)] hover:bg-[var(--pink-hover)]",
        secondary:
          "rounded-xl border border-white/15 bg-white/[0.08] text-foreground hover:bg-white/[0.14] dark:border-white/15",
        ghost:
          "rounded-xl text-[var(--muted)] hover:bg-[var(--glass-hover-bg)] hover:text-foreground",
        outline:
          "rounded-xl border border-[var(--glass-border)] bg-transparent text-foreground hover:bg-[var(--glass-hover-bg)] hover:border-[var(--pink)]/40",
        danger:
          "rounded-xl border border-[rgba(240,113,120,0.35)] bg-[rgba(240,113,120,0.12)] text-[var(--danger)] hover:bg-[rgba(240,113,120,0.2)]",
        success:
          "rounded-xl border border-[rgba(93,206,160,0.35)] bg-[rgba(93,206,160,0.12)] text-[var(--success)] hover:bg-[rgba(93,206,160,0.2)]",
        link: "text-[var(--pink)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-2xl px-6 text-[15px]",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const MotionButton = motion.button;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const reduce = useReducedMotion();
    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      return (
        <Slot className={classes} ref={ref} {...props} />
      );
    }

    if (reduce || variant === "link") {
      return (
        <button className={classes} ref={ref} {...props} />
      );
    }

    const {
      onDrag,
      onDragStart,
      onDragEnd,
      onAnimationStart,
      onAnimationEnd,
      ...rest
    } = props;

    return (
      <MotionButton
        className={classes}
        ref={ref}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={springSnappy}
        {...rest}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
