import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-medium tracking-wide transition-colors backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(240,168,200,0.35)] bg-[rgba(240,168,200,0.18)] text-[var(--pink-bright)]",
        secondary:
          "border-white/20 bg-white/10 text-white/80",
        success:
          "border-[rgba(93,206,160,0.4)] bg-[rgba(93,206,160,0.18)] text-[var(--success)]",
        danger:
          "border-[rgba(240,113,120,0.4)] bg-[rgba(240,113,120,0.18)] text-[var(--danger)]",
        warning:
          "border-[rgba(232,184,109,0.4)] bg-[rgba(232,184,109,0.18)] text-[var(--warning)]",
        info: "border-[rgba(142,180,255,0.4)] bg-[rgba(142,180,255,0.18)] text-[var(--info)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
