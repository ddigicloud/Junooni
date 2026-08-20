import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'
import { OrderTypes, Context } from "@medusajs/framework/types"

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,

    // ── Database connection pool ────────────────────────────────────────────
    // DEFAULT was 10 — too low for a marketplace with concurrent requests.
    //
    // WHY IT WAS CRASHING:
    // attachPlanFields ran one SQL query per vendor (28 vendors = 28 queries).
    // Promise.all fired all 28 simultaneously → needed 28 pool slots → pool
    // exhausted at 10 → new queries waited → 267-second timeout cascade →
    // everything else (products, collections, regions) timed out → OOM crash.
    //
    // IMMEDIATE FIX: pool.max = 25 so concurrent vendor queries don't exhaust it.
    // PERMANENT FIX: attachPlanFieldsBatch in vendors/route.ts (1 query for all).
    // Both fixes together = belt + suspenders.
    databaseDriverOptions: {
      pool: {
        min: 2,
        max: 25,           // was default 10
        acquireTimeoutMillis: 30000,   // fail fast after 30s instead of hanging forever
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
      },
    },

    //databaseLogging: process.env.DB_LOGGING === "true" ? ["query", "error"] : false,
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
    index: true,
  },
  plugins: [
  {
    resolve: "@medusajs/loyalty-plugin",
    options: {},
  }
],
  modules: [
    // ─── Auth (emailpass + Google OAuth for customers + Google OAuth for vendors) ─
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          {
            resolve: "@medusajs/medusa/auth-google",
            id: "google",
            options: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackUrl: process.env.GOOGLE_CALLBACK_URL,
            },
          },
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
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
          const id = Array.from({ length: 5 }, () =>
            chars.charAt(Math.floor(Math.random() * chars.length))
          ).join("")
          return id
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
    { resolve: "./src/modules/otp" },
    { resolve: "./src/modules/brand" },
    { resolve: "./src/modules/blank" },
    { resolve: "./src/modules/size-chart" },
    { resolve: "./src/modules/artwork" },
    { resolve: "./src/modules/wishlist" },
    { resolve: "./src/modules/product-review" },
    { resolve: "./src/modules/follow" },
    { resolve: "./src/modules/blog" },
    { resolve: "./src/modules/payout" },
    { resolve: "./src/modules/invoice-generator" },
    { resolve: "./src/modules/loyalty" },
    { resolve: "@medusajs/index" },
    // ─── Agentic Commerce (ChatGPT Instant Checkout) ───────────────────────────
    {
      resolve: "./src/modules/agentic-commerce",
      options: {
        signatureKey: process.env.AGENTIC_COMMERCE_SIGNATURE_KEY || "supersecret",
      },
    },
  ]
})