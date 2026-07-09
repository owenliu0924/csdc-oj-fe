"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-ring)]",

      "data-[state=unchecked]:border-white/15 data-[state=unchecked]:bg-white/10",

      "data-[state=checked]:border-[var(--pink)] data-[state=checked]:bg-[var(--pink)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full shadow-sm ring-0 transition-transform duration-200",

        "data-[state=unchecked]:translate-x-0.5 data-[state=unchecked]:bg-white/90",

        "data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-white data-[state=checked]:shadow-md"
      )}
    />
  </SwitchPrimitives.Root>

));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
