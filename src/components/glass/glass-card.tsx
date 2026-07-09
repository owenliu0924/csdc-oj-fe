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
        "glass w-full min-w-0 max-w-full rounded-[var(--radius-lg)]",
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
    <div
      className={cn(
        "glass flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-[var(--radius-lg)]",
        className
      )}
    >
      {(title || extra) && (
        <div className="flex min-w-0 shrink-0 items-center gap-3 border-b border-[var(--glass-border)] px-4 py-3 sm:px-6 sm:py-3.5">
          {title != null && title !== false ? (
            <div className="shrink-0 text-sm font-medium tracking-tight text-foreground">
              {title}
            </div>
          ) : null}
          {extra ? (
            <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
              <div className="inline-flex min-w-full items-center justify-end gap-2">
                {extra}
              </div>
            </div>
          ) : null}
        </div>
      )}
      <div className="min-w-0 max-w-full overflow-x-auto p-4 sm:p-5 sm:px-6">
        {children}
      </div>
    </div>
  );
}
