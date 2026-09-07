'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-xl font-semibold text-red-600">
        Failed to load editor
      </h2>

      <p className="mt-2 text-sm text-gray-600">{error.message}</p>

      <div className="mt-4 flex gap-4">
        <button
          onClick={reset}
          className="rounded bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700"
        >
          Try again
        </button>

        <Link
          href="/projects"
          className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Back to projects
        </Link>
      </div>
    </div>
  );
}
