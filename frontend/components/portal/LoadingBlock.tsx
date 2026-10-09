export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <div className="h-24 animate-pulse border border-line bg-surface" />
      <div className="h-24 animate-pulse border border-line bg-surface" />
    </div>
  );
}
