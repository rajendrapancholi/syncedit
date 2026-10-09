import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  reactCompiler: true,
  async rewrites() {
    const backendApiUrl =
      process.env.NEXT_PUBLIC_BASE_API || 'http://127.0.0.1:5000/api';
    return [
      {
        source: '/api/:path*',
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_BASE_API:
      process.env.NEXT_PUBLIC_BASE_API || 'http://127.0.0.1:5000/api',
    NEXT_PUBLIC_SOCKET_URL:
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://127.0.0.1:5000',
  },
};

export default nextConfig;
