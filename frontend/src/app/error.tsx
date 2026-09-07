"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void; }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong</h1>

            <p className="mb-6 text-center text-gray-700 dark:text-gray-300">
                {error.message || "An unexpected error occurred."}
            </p>

            <div className="flex gap-4">
                <button
                    onClick={reset}
                    className="rounded bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                    Try Again
                </button>

                <Link
                    href="/"
                    className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
