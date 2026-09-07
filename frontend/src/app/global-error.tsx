'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global-error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#f5f5f5',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '2rem',
            maxWidth: '420px',
            textAlign: 'center',
          }}
        >
          <AlertTriangle size={40} color="#eab308" />

          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: '0.875rem',
              color: '#a3a3a3',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            The app hit an unrecoverable error while loading. This has been
            logged — try reloading, and if it keeps happening, reach out with
            the error code below.
          </p>

          {error.digest && (
            <code
              style={{
                fontSize: '0.7rem',
                color: '#737373',
                background: '#171717',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
              }}
            >
              ref: {error.digest}
            </code>
          )}

          <button
            onClick={() => reset()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: '#f5f5f5',
              color: '#0a0a0a',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
