/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    // environment: "production",
    environment: "development",
  },
  images: {
    unoptimized: true,
  },
  // exportPathMap: async function (
  //   defaultPathMap,
  //   { dev, dir, outDir, distDir, buildId }
  // ) {
  //   return {
  //     "/": { page: "/rtoken" },
  //     "/rtoken": { page: "/rtoken" },
  //     "/reth/check-file": { page: "/check-file" },
  //     "/reth/token-stake": { page: "/rtoken" },
  //   };
  // },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/rtoken",
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
