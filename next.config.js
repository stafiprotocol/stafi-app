/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    // environment: "production",
    // environment: "development",
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
