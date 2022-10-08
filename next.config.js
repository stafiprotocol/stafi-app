/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/token-list",
        destination: "/",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/rtoken",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
