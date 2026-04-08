import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'
import { OrderTypes, Context } from "@medusajs/framework/types"

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      
      storeCors: process.env.STORE_CORS || "http://localhost:8000,http://localhost:5173",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000,http://localhost:3000,http://localhost:5173",
      authCors: process.env.AUTH_CORS || "http://localhost:8000,http://localhost:9000,http://localhost:3000,http://localhost:5173,https://chat.junooni.com,http://localhost:8000/in/account-callback,https://junooni.in/in/account-callback,https://junooni.com/in/account-callback,http://localhost:5173/auth-callback,https://studio.junooni.com/auth-callback",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  featureFlags: {
    view_configurations: true,
  },
  modules: [
    // ─── Auth (emailpass + Google OAuth for customers + Google OAuth for vendors) ─
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          // Email/password for everyone
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          // Google OAuth for CUSTOMERS (storefront)
          // Route: POST /auth/customer/google
          // Callback: http://localhost:8000/in/account-callback
          {
            resolve: "@medusajs/medusa/auth-google",
            id: "google",
            options: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackUrl: process.env.GOOGLE_CALLBACK_URL,
            },
          },
          // Google OAuth for VENDORS (studio dashboard)
          // Route: POST /auth/vendor/google-vendor
          // Callback: http://localhost:5173/auth-callback
          {
            resolve: "@medusajs/medusa/auth-google",
            id: "google-vendor",
            options: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackUrl: process.env.GOOGLE_VENDOR_CALLBACK_URL,
            },
          },
        ],
      },
    },

    // ─── Order (custom display ID) ─────────────────────────────────────────────
    {
      key: Modules.ORDER,
      resolve: "@medusajs/medusa/order",
      options: {
        generateCustomDisplayId: async (
          order: OrderTypes.CreateOrderDTO,
          sharedContext: Context
        ): Promise<string> => {
          const year = new Date().getFullYear()
          const random = Math.floor(Math.random() * 900000) + 100000
          return `JN-${year}-${random}`
        },
      },
    },

    // ─── Notifications (Resend) ────────────────────────────────────────────────
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

    // ─── Payment (Razorpay) ────────────────────────────────────────────────────
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

    // ─── Custom modules ────────────────────────────────────────────────────────
    { resolve: "./src/modules/marketplace" },
    { resolve: "./src/modules/brand" },
    { resolve: "./src/modules/blank" },
    { resolve: "./src/modules/size-chart" },
    { resolve: "./src/modules/artwork" },
    { resolve: "./src/modules/wishlist" },
    { resolve: "./src/modules/product-review" },
    { resolve: "./src/modules/follow" },
    {resolve: "./src/modules/blog" },
    { resolve: "./src/modules/payout" },
    { resolve: "./src/modules/invoice-generator" },
    { resolve: "./src/modules/loyalty" },
  ]
})