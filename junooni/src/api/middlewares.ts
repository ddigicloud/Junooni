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


import { PostCreateBlank } from "./blank/route"
import multer from "multer"


const upload = multer({ storage: multer.memoryStorage() })

const allowedOrigins = [
  "http://localhost:8000", // Storefront
  "http://localhost:3000", //Blanks
  "http://localhost:5173",
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
      matcher: "/vendors/*",
      method: ["GET","OPTIONS", "POST", "PUT", "DELETE"],
      middlewares: [
        (req, res, next) => {
          const configModule = req.scope.resolve("configModule");
          cors({
            origin: true, // Allow all origins dynamically
            credentials: true,
            methods: [ "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: [
              "Content-Type", 
              "Authorization", 
              "x-publishable-api-key"
            ]
          })(req, res, next);
        },
        authenticate(["vendor","user"], ["session", "bearer"])
      ]
    },
    {
      matcher: "/vendors/products*",
      method: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
      middlewares: [
        (req, res, next) => {
          const configModule = req.scope.resolve("configModule");
          cors({
            origin: true,
            credentials: true,
          })(req, res, next);
        },
        authenticate(["vendor","user"], ["session", "bearer"]),
        (req, res, next) => {
          // Apply validation only to POST, PUT, DELETE
          if (["POST", "PUT", "DELETE"].includes(req.method)) {
            validateAndTransformBody(AdminCreateProduct)(req, res, next);
          } else {
            next(); // Skip validation for GET and OPTIONS
          }
        }
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
        authenticate(["vendor","user"], ["session", "bearer"])
       
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
      matcher: "/store/customers/me/wishlists/items",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostStoreCreateWishlistItem),
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
      middlewares: [authenticate("vendor", ["session", "bearer"])],
    },
    {
      matcher: "/admin/products",
      method: ["POST"],
      additionalDataValidator: {
        brand_id: z.string().optional(),
      },
    }
   ],
  
});