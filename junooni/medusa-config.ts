import { loadEnv, defineConfig } from '@medusajs/framework/utils'

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
      resolve: "./src/modules/loyalty",
    }
  ]
})
