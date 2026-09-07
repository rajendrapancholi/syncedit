import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-col-center h-screen bg-background text-center gap-4 px-6">
      <FileQuestion size={48} className="text-muted-foreground/50" />

      <div className="space-y-1">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-sm text-muted-foreground">
          This page doesn't exist, or you don't have access to it.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-4 py-2 mt-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>
    </div>
  );
}