'use client';
export default function StatsError({ reset }: { reset: () => void }) {
  return (
    <div className="h-24 rounded-lg border border-destructive/30 bg-destructive/5 flex-col-center gap-2 text-xs">
      <span className="text-muted-foreground">Couldn't load stats</span>
      <button onClick={reset} className="text-primary underline">Retry</button>
    </div>
  );
}