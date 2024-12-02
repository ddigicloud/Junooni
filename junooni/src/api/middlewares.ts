import { defineMiddlewares, authenticate } from "@medusajs/medusa"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ConfigModule } from "@medusajs/framework/types"
import { parseCorsOrigins } from "@medusajs/framework/utils"
import { validateAndTransformBody } from "@medusajs/framework"
import { AdminCreateProduct } from "@medusajs/medusa/api/admin/products/validators"
import { z } from "zod"
import cors from "cors"


export default defineMiddlewares({
  routes: [
    {
      matcher: "/vendors",
      method: "POST",
      middlewares: [
        authenticate("vendor", ["session", "bearer"], {
          allowUnregistered: true,
        }),
        
        // Add CORS middleware
        (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          const configModule: ConfigModule = req.scope.resolve("configModule")
          return cors({ 
            origin: parseCorsOrigins(configModule.projectConfig.http.storeCors),
            credentials: true,
          })(req, res, next);
        },
      ],
    },
    {
      matcher: "/vendors/*",
      middlewares: [authenticate("vendor", ["session", "bearer"])],
    },
    {
      matcher: "/vendors/products",
      method: "POST",
      middlewares: [
        authenticate("vendor", ["session", "bearer"]),
        validateAndTransformBody(AdminCreateProduct),
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
    },

  ],
  
});
