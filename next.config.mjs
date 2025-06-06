/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // 👈 This skips ESLint errors on Vercel or local builds
  },
};

export default nextConfig;
