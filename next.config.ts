import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
