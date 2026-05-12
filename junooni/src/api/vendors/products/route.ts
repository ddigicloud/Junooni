import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework/http"
import {
  HttpTypes,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys
} from "@medusajs/framework/utils"
import createVendorProductWorkflow from "../../../workflows/marketplace/create-vendor-product"

const CREATOR_STORE_SC = process.env.CREATOR_STORE_SALES_CHANNEL_ID
  ?? "sc_01KMAP3HD1EVDF9FT7EHHHV8HP"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  if (!req.auth_context) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const storeOnly = req.query.store_only === "true"

  // const { data: [vendorAdmin] } = await query.graph({
  //   entity: "vendor_admin",
  //   fields: [
  //     "vendor.products.*",
  //     "vendor.products.images.*",
  //     "vendor.products.vendor.*",
  //     // needed for store_only filter — minimal overhead (just IDs)
  //     ...(storeOnly ? ["vendor.products.sales_channels.id"] : []),
  //   ],
  //   filters: {
  //     id: [req.auth_context.actor_id],
  //   },
  // })

  // REPLACE WITH:
const { data: [vendorAdmin] } = await query.graph({
  entity: "vendor_admin",
  fields: [
    "vendor.products.*",
    "vendor.products.images.*",
    "vendor.products.vendor.*",
    "vendor.products.categories.id",
    "vendor.products.categories.name",
    "vendor.products.categories.handle",
    "vendor.products.size_chart.*",
    ...(storeOnly ? ["vendor.products.sales_channels.id"] : []),
  ],
  filters: {
    id: [req.auth_context.actor_id],
  },
})

  let products = vendorAdmin?.vendor?.products ?? []

  // Filter by creator store sales channel when store_only=true
  if (storeOnly) {
    products = products.filter((p: any) =>
      p.sales_channels?.some((sc: any) => sc.id === CREATOR_STORE_SC)
    )
  }

  return res.json({ products })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateProduct>,
  res: MedusaResponse
) => {
  const { result } = await createVendorProductWorkflow(req.scope)
    .run({
      input: {
        vendor_admin_id: req.auth_context.actor_id,
        product: req.validatedBody,
        additional_data: req.validatedBody.additional_data
      }
    })

  res.json({ product: result.product })
}