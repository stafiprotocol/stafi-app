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
        destination: "/validator/reth/token-stake",
        permanent: true,
      },
      {
        source: "/reth/token-stake",
        destination: "/validator/reth/token-stake",
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
