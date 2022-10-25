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
    return [
      {
        source: "/",
        destination: "/reth/token-stake",
        permanent: true,
      },
      {
        source: "/rtoken",
        destination: "/reth/token-stake",
        permanent: true,
      },
    ];
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/token-list",
  //       destination: "/",
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
