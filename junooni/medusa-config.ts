// import { loadEnv, defineConfig } from '@medusajs/framework/utils'

// loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// module.exports = defineConfig({
//   projectConfig: {
//     databaseUrl: process.env.DATABASE_URL,
//     http: {
//       storeCors: process.env.STORE_CORS || "http://localhost:8000,http://localhost:5173",
//       adminCors: process.env.ADMIN_CORS || "http://localhost:9000,http://localhost:3000,http://localhost:5173",
//       authCors: process.env.AUTH_CORS || "http://localhost:8000,http://localhost:9000,http://localhost:3000,http://localhost:5173",
//       jwtSecret: process.env.JWT_SECRET || "supersecret",
//       cookieSecret: process.env.COOKIE_SECRET || "supersecret",
      
//     }
//   },
//   modules: [
//     {
//       resolve: "@medusajs/medusa/notification",
//       options: {
//         providers: [
//           {
//             resolve: "./src/modules/resend",
//             id: "resend",
//             options: {
//               channels: ["email"],
//               api_key: process.env.RESEND_API_KEY,
//               from: process.env.RESEND_FROM_EMAIL,
//             },
//           },
//         ],
//       },
//     },
//     {
//       resolve: "./src/modules/marketplace",
//     },
//     {
//       resolve: "./src/modules/brand",
//     },
//     {
//       resolve: "./src/modules/blank",
//     },
//     {
//       resolve: "./src/modules/size-chart",
//     },
//     {
//       resolve: "./src/modules/wishlist"
//     },
//     {
//       resolve: "./src/modules/product-review"
//     },
//     {
//       resolve: "./src/modules/follow",
//     },
//     {
//       resolve: "./src/modules/loyalty",
//     }
//   ]
// })


import { loadEnv, defineConfig, Modules,  ContainerRegistrationKeys} from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000,http://localhost:5173",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000,http://localhost:3000,http://localhost:5173",
      authCors: process.env.AUTH_CORS || "http://localhost:8000,http://localhost:9000,http://localhost:3000,http://localhost:5173",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/resend",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM_EMAIL,
            },
          },
        ],
      },
    },
  //  {
  //       resolve: "@medusajs/medusa/auth",
  //        key: Modules.AUTH,
  //       dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
  //       options: {
  //         providers: [
  //           // other providers...
  //           {
  //             resolve: "@medusajs/medusa/auth-google",
  //             id: "google",
  //             options: {
  //               clientId: process.env.GOOGLE_CLIENT_ID,
  //               clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //               callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  //             },
  //           },
  //           {
  //             resolve: "@medusajs/medusa/auth",
  //             id: "emailpass",

  //           },
  //         ],
  //       },
  //     },

    // Add Google Auth Module
    // {
    //   resolve: "@medusajs/medusa/auth",
    //   key: Modules.AUTH,
    //   options: {
    //     providers: [
    //       {
    //         resolve: "@medusajs/medusa/auth-google",
    //         id: "google",
    //         options: {
    //           clientId: process.env.GOOGLE_CLIENT_ID,
    //           clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //           callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/auth/google/callback",
    //         },
    //       },
    //     ],
    //   },
    // },
    // {
    //     resolve: "@medusajs/medusa/auth",
    //     dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
    //     options: {
    //       providers: [
    //         // other providers...
    //         {
    //           resolve: "@medusajs/medusa/auth-google",
    //           id: "google",
    //           options: {
    //             clientId: process.env.GOOGLE_CLIENT_ID,
    //             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //             callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    //           },
    //         },
    //       ],
    //     },
    //   },


    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payment-razorpay",
            id: "razorpay",
            options: {
              key_id: process.env.RAZORPAY_ID,
              key_secret: process.env.RAZORPAY_SECRET,
            },
          },
        ],
      },
    },

    {
      resolve: "./src/modules/marketplace",
    },
  
    {
      resolve: "./src/modules/brand",
    },
    {
      resolve: "./src/modules/blank",
    },
    {
      resolve: "./src/modules/size-chart",
    },
    {
      resolve: "./src/modules/wishlist"
    },
    {
      resolve: "./src/modules/product-review"
    },
    {
      resolve: "./src/modules/follow",
    },
    {
      resolve: "./src/modules/payout",
    },
    {
      resolve: "./src/modules/invoice-generator",
    },
    {
      resolve: "./src/modules/loyalty",
    }
  ]
})