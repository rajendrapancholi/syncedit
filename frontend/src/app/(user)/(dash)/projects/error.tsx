"use client";

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
                Failed to fetch projects
            </h2>

            <p className="mt-2 text-sm text-gray-600">
                {error.message}
            </p>

            <button
                onClick={reset}
                className="mt-4 rounded bg-cyan-600 px-4 py-2 text-white"
            >
                Try again
            </button>
        </div>
    );
}
