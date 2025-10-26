/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // silence optional RN dependency used by metamask-sdk in web builds
    config.resolve.alias["@react-native-async-storage/async-storage"] = false;
    return config;
  },
}

export default nextConfig
