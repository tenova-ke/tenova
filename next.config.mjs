/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,   // keep what you already had

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "osx-temperature-sensor": false,
    };
    return config;
  },
};

export default nextConfig;
