/** @type {import('next').NextConfig} */
// Served from a custom domain (lowtidelab.dev) at the root, so no basePath/assetPrefix needed.
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
