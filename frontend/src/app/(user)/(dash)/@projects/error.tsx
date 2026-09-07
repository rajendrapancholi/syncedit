'use client';
export default function ProjectsError({ reset }: { reset: () => void }) {
  return (
    <div className="p-6 rounded-lg border border-destructive/30 bg-destructive/5 text-center text-xs space-y-2">
      <p className="text-muted-foreground">Couldn't load your projects</p>
      <button onClick={reset} className="text-primary underline">Retry</button>
    </div>
  );
}