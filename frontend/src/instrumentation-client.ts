export function onRouterTransitionStart(
  href: string,
  navigationType: 'push' | 'replace' | 'traverse',
) {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[nav:${navigationType}] -> ${href}`);
  }
  // analytics.track('navigation', { href, navigationType });
}
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('[client-error]', event.error ?? event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[client-unhandled-rejection]', event.reason);
  });
}