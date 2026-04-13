// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       { protocol: "http",  hostname: "localhost" },
//       { protocol: "https", hostname: "*.junooni.com" },
//       { protocol: "https", hostname: "junooni.com" },
//     ],
//   },
// }

// module.exports = nextConfig
// junooni-creator-store/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js about all hostnames it will serve
  // (needed for next/image and to suppress hostname warnings)
  images: {
    remotePatterns: [
      { protocol: "http",  hostname: "localhost" },
      { protocol: "https", hostname: "*.junooni.com" },
      { protocol: "https", hostname: "junooni.com" },
      // Add any CDN/S3/Cloudinary domains you use for product images
      { protocol: "https", hostname: "*.cloudinary.com" },
      { protocol: "https", hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com" },
    ],
  },

  // Allow Next.js to serve requests from custom creator domains
  // List known custom domains here, OR handle dynamically via middleware
  // (middleware approach is preferred — no config change per domain)
  experimental: {
    // Required if you use server actions across custom domains
    // serverActions: { allowedOrigins: ["*.junooni.com"] },
  },
}

module.exports = nextConfig