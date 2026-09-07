'use client';

import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function DashSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-col-center min-h-[60vh] gap-4">
      <div className="p-4 rounded-full bg-destructive/10 text-destructive">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-xl font-bold">Something broke in this section</h2>
      <p className="text-muted-foreground text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="flex-center gap-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary-hover transition-all cursor-pointer"
      >
        <RefreshCcw size={16} /> Try Again
      </button>
    </div>
  );
}