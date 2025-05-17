import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework/http";
import { 
  HttpTypes,
} from "@medusajs/framework/types"
import { 
  ContainerRegistrationKeys
} from "@medusajs/framework/utils"
import createVendorProductWorkflow from "../../../workflows/marketplace/create-vendor-product";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)


  if (!req.auth_context) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  const { data: [vendorAdmin] } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.products.*",
      "vendor.products.variants.*",
      "vendor.products.images.*",
      "vendor.products.options.*",
      "vendor.products.options.metadata.*",
      "vendor.products.variants.options.*",
      "vendor.products.options.values.*",
     
      "vendor.products.variants.inventory_items.*",
      "vendor.products.description_parts",
      "vendor.products.variants.inventory_items.inventory.in_stock",
      "vendor.products.brand.*",
      "vendor.products.categories.*",
      "vendor.products.tags.*",
      "vendor.products.vendor.*",
      "vendor.products.metadata"
    ],
    filters: {
      id: [
        // ID of the authenticated vendor admin
        req.auth_context.actor_id
      ],
    },
  })

  res.json({
    products: vendorAdmin.vendor.products
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateProduct>,
  res: MedusaResponse
) => {
  const { result } = await createVendorProductWorkflow(req.scope)
    .run({
      input: {
        vendor_admin_id: req.auth_context.actor_id,
        product: req.validatedBody
      }
    })

  res.json({
    product: result.product
  })
}