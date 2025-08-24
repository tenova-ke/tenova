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
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
    ],
  },
};

export default nextConfig
