/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "media.istockphoto.com",
      "images.unsplash.com",
      "res.cloudinary.com", // added Cloudinary
    ],
  },
};

export default nextConfig;
