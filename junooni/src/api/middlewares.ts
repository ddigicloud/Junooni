import { defineMiddlewares, authenticate } from "@medusajs/medusa"
import { validateAndTransformBody } from "@medusajs/framework"
import { AdminCreateProduct } from "@medusajs/medusa/api/admin/products/validators"
import { z } from "zod"


export default defineMiddlewares({
  routes: [
    {
      matcher: "/vendors",
      method: "POST",
      middlewares: [
        authenticate("vendor", ["session", "bearer"], {
          allowUnregistered: true,
        }),
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
