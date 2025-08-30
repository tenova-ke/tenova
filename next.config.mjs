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

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co", // ✅ Spotify album/track covers
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "e1.yotools.net", // ✅ Ephoto360 generated images
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "e2.yotools.net", // ✅ Some effects load from e2
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
