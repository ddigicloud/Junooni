/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http",  hostname: "localhost" },
      { protocol: "https", hostname: "*.junooni.com" },
      { protocol: "https", hostname: "junooni.com" },
    ],
  },
}

module.exports = nextConfig