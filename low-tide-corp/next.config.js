/** @type {import('next').NextConfig} */
const nextConfig = {
  // This app needs a live server (DB writes, SSE streaming, LLM calls),
  // so it is NOT statically exported like the main lowtidelab site.
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

module.exports = nextConfig;
