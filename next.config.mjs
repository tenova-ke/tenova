/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ disables lint blocking deploy
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "osx-temperature-sensor": false, // ✅ avoids Render build crash
    };
    return config;
  },
};

export default nextConfig;
