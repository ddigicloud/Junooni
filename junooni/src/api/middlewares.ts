// import { defineMiddlewares, authenticate } from "@medusajs/medusa"
// import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import {  validateAndTransformQuery } from "@medusajs/framework/http"
// import { ConfigModule } from "@medusajs/framework/types"
// import { parseCorsOrigins } from "@medusajs/framework/utils"
// import { validateAndTransformBody } from "@medusajs/framework"
// import { AdminCreateProduct } from "@medusajs/medusa/api/admin/products/validators"
// import { createFindParams } from "@medusajs/medusa/api/utils/validators"
// import { z } from "zod"
// import cors from "cors"
// import { PostAdminCreateBrand } from "./admin/brand/validators"

// import { PostCreateBlank } from "./blank/route"
// import multer from "multer"


// const upload = multer({ storage: multer.memoryStorage() })

// const allowedOrigins = [
//   "http://localhost:8000", // Storefront
//   "http://localhost:3000",
//   "http://localhost:5173"
// ];

// export const GetBrandsSchema = createFindParams()
// export default defineMiddlewares({
//   routes: [
//     {
//       matcher: "/vendors",
//       method: "POST",
//       middlewares: [
//         authenticate("vendor", ["session", "bearer"], {
//           allowUnregistered: true,
//         }),
//       ],
//     },
//     {
//       matcher: "/vendors/*",
//       middlewares: [
//         authenticate("vendor", ["session", "bearer"]),
//       ]
//     },
//     {
//       matcher: "/vendors/products",
//       method: "POST",
//       middlewares: [
//         authenticate("vendor", ["session", "bearer"]),
//         validateAndTransformBody(AdminCreateProduct),
//       ]
//     }
// ,
//     {
//       matcher: "/vendors/uploads",
//       method: ["OPTIONS", "POST"],
//       middlewares: [
//         (req, res, next) => {
//           const configModule = req.scope.resolve("configModule");
//           cors({
//             origin: true,
//             credentials: true,
//           })(req, res, next);
//         },
//         upload.array("files"),
//         authenticate("vendor", ["session", "bearer"])
       
//       ],
//     },
//     {
//       matcher: "/blank",
//       method: "POST",
//       middlewares: [
//         validateAndTransformBody(PostCreateBlank),
//       ],
//     },
      
//     {
//       matcher: "/admin/brands",
//       method: "POST",
//       middlewares: [
//         validateAndTransformBody(PostAdminCreateBrand),
//       ],
//     },
//     {
//       matcher: "/admin/brands",
//       method: "GET",
//       middlewares: [
//         validateAndTransformQuery(
//           GetBrandsSchema,
//           {
//             defaults: [
//               "id",
//               "name",
//               "products.*",
//             ],
//             isList: true,
//           }
//         ),
//       ],
//     },
//     {
//       matcher: "/admin/orders/*",
//       method: "POST",
//       middlewares: [authenticate("vendor", ["session", "bearer"])],
//     },
//     {
//       matcher: "/admin/products",
//       method: ["POST"],
//       additionalDataValidator: {
//         brand_id: z.string().optional(),
//       },
//     }
//    ],
  
// });


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

import { PostCreateBlank } from "./blank/route"
import multer from "multer"


const upload = multer({ storage: multer.memoryStorage() })

const allowedOrigins = [
  "http://localhost:8000", // Storefront
  "http://localhost:3000", // Vendor Dashboard
  "http://localhost:5173"
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
            "http://localhost:5173" // Add vendor dashboard origin here
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
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: [
              "Content-Type", 
              "Authorization", 
              "x-publishable-api-key"
            ]
          })(req, res, next);
        },
        authenticate("vendor", ["session", "bearer"])
      ]
    },
    {
      matcher: "/vendors/products",
      method: ["OPTIONS", "POST"],
      middlewares: [
        (req, res, next) => {
          const configModule = req.scope.resolve("configModule");
          cors({
            origin: true,
            credentials: true,
          })(req, res, next);
        },
        authenticate("vendor", ["session", "bearer"]),
        validateAndTransformBody(AdminCreateProduct),
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
        authenticate("vendor", ["session", "bearer"])
       
      ],
    },
    {
      matcher: "/blank",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostCreateBlank),
      ],
    },
      
    {
      matcher: "/admin/brands",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostAdminCreateBrand),
      ],
    },
    {
      matcher: "/admin/brands",
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