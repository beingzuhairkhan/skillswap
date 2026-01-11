/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      "media.istockphoto.com",
      "images.unsplash.com",
      "res.cloudinary.com", // added Cloudinary
    ],
  },
};

export default nextConfig;
