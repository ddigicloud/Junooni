import { defineMiddlewares, authenticate } from "@medusajs/medusa"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {  validateAndTransformQuery } from "@medusajs/framework/http"
import { ConfigModule } from "@medusajs/framework/types"
import { parseCorsOrigins } from "@medusajs/framework/utils"
import { validateAndTransformBody } from "@medusajs/framework"
import { AdminCreateProduct } from "@medusajs/medusa/api/admin/products/validators"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { z } from "zod"
import cors from "cors"
import { PostAdminCreateBrand } from "./admin/brand/validators"
import { PostStoreCreateWishlistItem } from "./store/customers/me/wishlists/items/validators"
import {PostStoreCreateFollowList} from "./store/customers/me/follow/lists/validators"
import { PostVendorCreateSchema } from "./vendors/route"
import { GetAdminReviewsSchema } from "./admin/reviews/route"
import { PostAdminUpdateReviewsStatusSchema } from "./admin/reviews/status/route"
import { SearchSchema } from "./store/products/search/route"
import {PostStoreReviewSchema} from "./store/reviews/route"
import {CheckHandleSchema} from "./vendors/check-handle/route"
import { PostAdminCreateSizeChartType } from "./admin/size-chart/validators"
import {createVendorArtworkSchema} from "./validation-schemas"
import artwork from "src/modules/artwork"


import { PostCreateBlank } from "./blank/route"
import multer from "multer"


const upload = multer({ storage: multer.memoryStorage() })

const allowedOrigins = [
  "http://localhost:8000", // Storefront
  "http://localhost:3000", //Blanks
  "http://localhost:5173",
  "https://chat.junooni.com/",
  "http://localhost:9000"  // Vendor Dashboard
 
];

export const GetBrandsSchema = createFindParams()
export default defineMiddlewares({
  routes: [
    {
      matcher: "/auth/vendor/*",
      method: ["OPTIONS", "POST"],
      middlewares: [
        (req, res, next) => {
          const configModule = req.scope.resolve("configModule");
    
          // Define multiple origins
          const allowedOrigins = [
            ...parseCorsOrigins(configModule.projectConfig.http.storeCors),
            "http://localhost:5173","http://localhost:9000" // Add vendor dashboard origin here
          ];
    
          // CORS middleware with dynamic origin handling
          cors({
            origin: (origin, callback) => {
              if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true); // Allow the request
              } else {
                callback(new Error("Not allowed by CORS"));
              }
            },
            credentials: true,
          })(req, res, next);
        },
      ],
    },
    {
      matcher: "/vendors",
      method: ["OPTIONS", "POST"], // Handle preflight OPTIONS and POST
      middlewares: [
        // CORS Middleware
        (req, res, next) => {
          const configModule = req.scope.resolve("configModule");
          cors({
            origin:true,
            credentials: true,
            methods: ["POST", "OPTIONS"], // Allow specific methods
            allowedHeaders: [
              "Content-Type",
              "Authorization",
              "x-publishable-api-key",
            ], // Add necessary headers
          })(req, res, next);
        },
        // Preflight Response for OPTIONS
        (req, res, next) => {
          if (req.method === "OPTIONS") {
            res.status(204).end(); // Respond to OPTIONS preflight
            return;
          }
          next();
        },
        // Authentication Middleware
        authenticate("vendor", ["session", "bearer"], {
          allowUnregistered: true, // Allow unauthenticated requests
        }),
        validateAndTransformBody(PostVendorCreateSchema),
      ],
    },
    {
      matcher: "/vendors/uploads",
      method: ["OPTIONS", "POST"],
      middlewares: [
        (req, res, next) => {
          const configModule = req.scope.resolve("configModule");
          cors({
            origin: true,
            credentials: true,
          })(req, res, next);
        },
        upload.array("files"),
        authenticate("vendor", ["session", "bearer"], {
          allowUnregistered: true, // Allow unauthenticated requests
        })
       
      ],
    },
   {
      matcher: "/vendors/products*",
      method: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
      middlewares: [
        // CORS
        (req, res, next) => {
          const configModule = req.scope.resolve("configModule")
          cors({
            origin: true,
            credentials: true,
          })(req, res, next)
        },
    
        // Auth
        authenticate(["vendor", "user"], ["session", "bearer"]),
    
        // Conditional Validation
        (req, res, next) => {
          const isModifying = ["POST"].includes(req.method)
    
          // Check if path is EXACTLY /vendors/products or /vendors/products/:id
          const isMainProductRoute = /^\/vendors\/products(\/[^\/]+)?$/.test(req.path)
    
          if (isModifying && isMainProductRoute) {
            validateAndTransformBody(AdminCreateProduct)(req, res, next)
          } else {
            next()
          }
        }
      ],
      additionalDataValidator: {
        brand_id: z.string().optional(),
        size_chart_id: z.string().optional(),
        vendor_artwork_id: z.string().optional(),

      },
    },    
    
     {
      matcher: "/admin/artwork",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(createVendorArtworkSchema),
      ],
    },
    {
      matcher: "/admin/artwork/upload",
      method: "POST",
      middlewares: [
        upload.array("files"),
      ],
    },
    {
      matcher: "/vendors/artwork",
      method: "POST",
      middlewares: [
        validateAndTransformBody(createVendorArtworkSchema),
      ],
    },
    {
      matcher: "/vendors/artwork/upload",
      method: "POST",
      middlewares: [
        upload.array("files"),
      ],
    },
    {
      matcher: "/vendors/size-chart",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostAdminCreateSizeChartType),
      ],
    },
    {
      matcher: "/admin/size-chart",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(PostAdminCreateSizeChartType),
      ],
      
    },
    
    {
      matcher: "/vendors/me",
      method: ["GET","PUT"],
      middlewares: [
        (req, res, next) => {
          const configModule = req.scope.resolve("configModule");
          cors({
            origin: true,
            credentials: true,
          })(req, res, next);
        },
       
        authenticate(["vendor","user"], ["session", "bearer"])
       
      ],
    },
    {
      matcher: "/vendors/check-handle",
      method: ["OPTIONS", "POST"], // Handle preflight OPTIONS and POST
      middlewares: [
        // CORS Middleware
        (req, res, next) => {
          const configModule = req.scope.resolve("configModule");
          cors({
            origin:true,
            credentials: true,
            methods: ["POST", "OPTIONS"], // Allow specific methods
            allowedHeaders: [
              "Content-Type",
              "Authorization",
              "x-publishable-api-key",
            ], // Add necessary headers
          })(req, res, next);
        },
        // Preflight Response for OPTIONS
        (req, res, next) => {
          if (req.method === "OPTIONS") {
            res.status(204).end(); // Respond to OPTIONS preflight
            return;
          }
          next();
        },
        // Authentication Middleware
        authenticate("vendor", ["session", "bearer"], {
          allowUnregistered: true, // Allow unauthenticated requests
        }),
        validateAndTransformBody(CheckHandleSchema),
      ],
    },
    {
  matcher: "/vendors/*",
  method: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
  middlewares: [
    (req, res, next) => {
      const configModule = req.scope.resolve("configModule");
      cors({
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "x-publishable-api-key"
        ]
      })(req, res, next);
    },
    (req, res, next) => {
      const publicPaths = [
        /^\/vendors\/[^/]+\/followers$/, // Regex to match /vendors/[id]/followers
        /^\/vendors\/check-handle$/,      // /vendors/check-handle
        /^\/vendors\/uploads$/,  
        /^\/vendors\/payout$/,
         /^\/vendors\/me$/,         // /vendors/uploads
      ];

      const isPublic = publicPaths.some((pattern) => pattern.test(req.path));
      if (isPublic) {
        return next(); // Allow without auth
      }

      // Else apply auth
      return authenticate(["vendor", "user"], ["session", "bearer"])(req, res, next);
    }
  ]
},
{
      matcher: "/store/razorpay/authorize",
      method: "POST",
      middlewares: [
         (req, res, next) => {
          const configModule = req.scope.resolve("configModule")
          cors({
            origin: true,
            credentials: true,
          })(req, res, next)
        },
       
      ],
    },
    {
      matcher: "/admin/brand",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostAdminCreateBrand),
      ],
    },
    {
      matcher: "/admin/brand",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(
          GetBrandsSchema,
          {
            defaults: [
              "id",
              "name",
              "products.*",
            ],
            isList: true,
          }
        ),
      ],
    },
    {
      matcher: "/vendors/brand",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostAdminCreateBrand),
      ],
    },
    {
      matcher: "/vendors/brand",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(
          GetBrandsSchema,
          {
            defaults: [
              "id",
              "name",
              "products.*",
            ],
            isList: true,
          }
        ),
      ],
    },
    {
      matcher: "/store/customers/me/wishlists/items",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostStoreCreateWishlistItem),
      ],
    },
    {
      matcher: "/store/customers/me/loyalty-points",
      method: "GET",
      middlewares: [
        
      ],
    },
    {
      matcher: "/store/customers/me/follow/lists",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostStoreCreateFollowList),
      ],
    },
    {
      matcher: "/store/customers/me/orders/:order_id/invoice",
      method: "POST",
      middlewares: [
        (req, res, next) => {
          const configModule = req.scope.resolve("configModule")
          cors({
            origin: true,
            credentials: true,
          })(req, res, next)
        },
        authenticate("customer", ["session", "bearer"]),
      ],
    },
    {
      matcher: "/store/products/search",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(SearchSchema),
      ],
    },
    {
      matcher: "/store/customers/me/follow",
      method: "POST",
      middlewares: [
       
      ],
    },
    {
      matcher: "/vendors/payout",
      method: "GET",
      middlewares: [
       
      ],
    },
    {
      matcher: "/admin/reviews",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetAdminReviewsSchema, {
          isList: true,
          defaults: [
            "id",
            "title",
            "content",
            "rating",
            "product_id",
            "customer_id",
            "status",
            "created_at",
            "updated_at",
            "product.*",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/reviews/status",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(PostAdminUpdateReviewsStatusSchema),
      ],
    },
    {
      matcher: "/store/reviews",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(PostStoreReviewSchema),
      ],
    },
    
    {
      matcher: "/admin/orders/*",
      method: "POST",
      middlewares: [ authenticate(["vendor","user"], ["session", "bearer"])],
    },
    {
      matcher: "/admin/products",
      method: ["POST"],
      additionalDataValidator: {
        brand_id: z.string().optional(),
        size_chart_id: z.string().optional(),
        artwork_id: z.string().optional(),
      },
    }
   ],
  
});