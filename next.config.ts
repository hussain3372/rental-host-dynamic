/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rental-host-images.s3.eu-north-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
        unoptimized: true, // Add this line as fallback

  },
};

export default nextConfig;
