/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/token-list",
        destination: "/",
      },
    ];
  },
};

module.exports = nextConfig;
