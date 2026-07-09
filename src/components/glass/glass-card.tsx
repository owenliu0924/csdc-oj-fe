import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  strong?: boolean;
  padding?: boolean;
};

export function GlassCard({
  className,
  strong: _strong,
  padding = true,
  children,
  ...props
}: Props) {
  return (
    <div
      className={cn(
        "glass rounded-[var(--radius-lg)]",
        padding && "p-5 sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>

  );
}

export function GlassPanel({
  title,
  extra,
  children,
  className,
}: {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-[var(--radius-lg)]", className)}>
      {(title || extra) && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--glass-border)] px-5 py-3.5 sm:px-6">
          <div className="text-sm font-medium tracking-tight text-foreground">
            {title}
          </div>

          {extra && (
            <div className="flex shrink-0 items-center gap-2">{extra}</div>

          )}
        </div>

      )}

      <div className="overflow-x-auto p-5 sm:p-6">{children}</div>

    </div>

  );
}
