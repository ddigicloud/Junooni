// const checkEnvVariables = require("./check-env-variables")

// checkEnvVariables()

// /**
//  * @type {import('next').NextConfig}
//  */
// const nextConfig = {
//   reactStrictMode: true,
//   logging: {
//     fetches: {
//       fullUrl: true,
//     },
//   },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: "http",
//         hostname: "localhost",
//       },
//       {
//         protocol: "https",
//         hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
//       },
//       {
//       protocol: "https",
//       hostname: "**",  // ✅ allows any https domain
//     },
//     {
//       protocol: "http", 
//       hostname: "**",  // ✅ allows any http domain (local dev)
//     },
//       {
//         protocol: "https",
//         hostname: "digicloud9.com",
//          pathname: "/wp-content/uploads/**",
//       },
//       {
//         protocol: "https",
//         hostname: "medusa-server-testing.s3.amazonaws.com",
//       },
//       {
//         protocol: "https",
//         hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
//       },
//       {
//         protocol: "https",
//         hostname: "files.junooni.com",
//         pathname: "/**",
//       },
//     ],
//   },
// }

// module.exports = nextConfig



const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [50, 60, 75],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http", 
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "digicloud9.com",
         pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "files.junooni.com",
        pathname: "/**",
      },
    ],
  },
}

module.exports = nextConfig