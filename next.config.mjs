/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "zustand"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**"
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
        pathname: "**"
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        pathname: "**"
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
        pathname: "**"
      }
    ]
  }
};

export default nextConfig;
