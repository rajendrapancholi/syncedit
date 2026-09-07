export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const required = [
      'JWT_SECRET',
      'NEXT_PUBLIC_BASE_API',
      'NEXT_PUBLIC_SOCKET_URL',
    ];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      console.error(
        `[instrumentation] Missing required env vars: ${missing.join(', ')}`,
      );
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Cannot start: missing env vars ${missing.join(', ')}`);
      }
    }

    console.log(
      `[instrumentation] node runtime ready — env=${process.env.NODE_ENV}`,
    );
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('[instrumentation] edge runtime ready (proxy.ts)');
  }
}
export async function onRequestError(
  err: unknown,
  request: {
    path: string;
    method: string;
    headers: Record<string, string | string[] | undefined>;
  },
  context: {
    routerKind: 'Pages Router' | 'App Router';
    routePath: string;
    routeType: 'render' | 'route' | 'action' | 'middleware';
  },
) {
  const message = err instanceof Error ? err.message : String(err);

  console.error('[server-error]', {
    message,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  });
}
