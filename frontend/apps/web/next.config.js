/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol:"https",
        hostname:"lh3.googleusercontent.com"
      }
    ],
  },
  output: "standalone",
  experimental: {
    workerThreads: false,
  },
};

export default nextConfig;
