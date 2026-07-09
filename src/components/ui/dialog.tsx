"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { springSoft } from "@/lib/motion";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  const reduce = useReducedMotion();
  return (
    <DialogPrimitive.Overlay ref={ref} asChild {...props}>
      <motion.div
        className={cn(
          "fixed inset-0 z-[100] bg-black/50 backdrop-blur-md",
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduce ? { duration: 0.12 } : { duration: 0.3 }}
      />
    </DialogPrimitive.Overlay>

  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const reduce = useReducedMotion();

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} asChild {...props}>
        <motion.div
          className={cn(
            "fixed left-1/2 top-1/2 z-[101] grid w-[calc(100%-2rem)] max-w-md gap-5 glass-float rounded-[var(--radius-lg)] p-6",
            className
          )}
          initial={
            reduce
              ? { opacity: 1, scale: 1, x: "-50%", y: "-50%" }
              : { opacity: 0, scale: 0.94, x: "-50%", y: "calc(-50% + 14px)" }
          }
          animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
          transition={reduce ? { duration: 0.12 } : springSoft}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-xl p-1.5 text-[var(--muted)] transition-all duration-200 hover:bg-[var(--pink-soft)] hover:text-[var(--pink-bright)] hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--pink-ring)]">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>

          </DialogPrimitive.Close>

        </motion.div>

      </DialogPrimitive.Content>

    </DialogPortal>

  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-base font-medium leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-[var(--muted)]", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
