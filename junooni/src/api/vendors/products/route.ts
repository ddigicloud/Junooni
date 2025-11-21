// import { 
//   AuthenticatedMedusaRequest, 
//   MedusaResponse
// } from "@medusajs/framework/http";
// import { 
//   HttpTypes,
// } from "@medusajs/framework/types"
// import { 
//   ContainerRegistrationKeys
// } from "@medusajs/framework/utils"
// import createVendorProductWorkflow from "../../../workflows/marketplace/create-vendor-product";
//  import {  QueryContext } from "@medusajs/framework/utils";


// export const GET = async (
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) => {
//   const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  


//   if (!req.auth_context) {
//     return res.status(401).json({
//       message: "Authentication required"
//     });
//   }

//   const { data: [vendorAdmin] } = await query.graph({
//     entity: "vendor_admin",
//     fields: ["vendor.products.*",
//       "vendor.products.variants.*",
//       "vendor.products.images.*",
//       "vendor.products.options.*",
//       "vendor.products.options.metadata.*",
//       "vendor.products.variants.options.*",
//       "vendor.products.options.values.*",
//      // "vendor.products.variants.calculated_price.*",
     
     
//       "vendor.products.variants.inventory_items.*",
//       "vendor.products.description_parts",
//       "vendor.products.variants.inventory_items.inventory.in_stock",
//       "vendor.products.brand.*",
//       "vendor.products.categories.*",
//       "vendor.products.tags.*",
//       "vendor.products.vendor.*",
//       //"vendor.products.size_chart.*",
//       //"vendor.products.artwork.*",
//       "vendor.products.metadata"
//     ],
//     filters: {
//       id: [
//         // ID of the authenticated vendor admin
//         req.auth_context.actor_id
//       ],
//     }
//   })

//   res.json({
//     products: vendorAdmin.vendor.products
//   })
// }

// export const POST = async (
//   req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateProduct>,
//   res: MedusaResponse
// ) => {
//   const { result } = await createVendorProductWorkflow(req.scope)
//     .run({
//       input: {
//         vendor_admin_id: req.auth_context.actor_id,
//         product: req.validatedBody,
//         additional_data: req.validatedBody.additional_data
//       }
//     })

//   res.json({
//     product: result.product
//   })
// }

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

  // Get pagination parameters from query string
  const limit = parseInt(req.query.limit as string) || 100;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    // Fetch vendor admin with products using pagination
    const { data: vendorAdmins } = await query.graph({
      entity: "vendor_admin",
      fields: [
        "vendor.products.*",
        "vendor.products.variants.*",
        "vendor.products.images.*",
        "vendor.products.options.*",
        "vendor.products.options.values.*",
        "vendor.products.variants.options.*",
        "vendor.products.variants.inventory_items.*",
        "vendor.products.variants.inventory_items.inventory.stocked_quantity",
        "vendor.products.brand.*",
        "vendor.products.categories.*",
        "vendor.products.tags.*",
        "vendor.products.vendor.*",
        "vendor.products.metadata"
      ],
      filters: {
        id: [req.auth_context.actor_id]
      }
    });

    const vendorAdmin = vendorAdmins?.[0];

    if (!vendorAdmin || !vendorAdmin.vendor) {
      return res.status(404).json({
        message: "Vendor not found",
        products: [],
        count: 0
      });
    }

    // Get all products
    const allProducts = vendorAdmin.vendor.products || [];
    const totalCount = allProducts.length;

    // Apply pagination manually
    const paginatedProducts = allProducts.slice(offset, offset + limit);

    res.json({
      products: paginatedProducts,
      count: totalCount,
      limit,
      offset
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Failed to fetch products",
      error: error?.message || "Unknown error",
      products: [],
      count: 0
    });
  }
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

  res.json({
    product: result.product
  })
}