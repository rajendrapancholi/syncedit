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
};

export default nextConfig;
