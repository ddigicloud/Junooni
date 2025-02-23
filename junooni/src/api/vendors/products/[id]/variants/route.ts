import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import MarketplaceModuleService from "../../../../../modules/marketplace/service";
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id: productId } = req.params; // Extract product ID from URL
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE);

    // Retrieve vendor admin details
    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(req.auth_context.actor_id, {
      relations: ["vendor"],
    });

    // Fetch product variants for the vendor
    const {
      data: [vendor],
    } = await query.graph({
      entity: "vendor",
      fields: ["products.id", "products.variants.*", "products.variants.prices.*", "products.options.*"],
      filters: { id: vendorAdmin.vendor.id },
    });

    const product = vendor?.products?.find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found or not associated with the vendor" });
    }

    const variants = product.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku,
      barcode: variant.barcode,
      ean: variant.ean,
      upc: variant.upc,
      allow_backorder: variant.allow_backorder,
      manage_inventory: variant.manage_inventory,
      hs_code: variant.hs_code,
      origin_country: variant.origin_country,
      mid_code: variant.mid_code,
      material: variant.material,
      weight: variant.weight,
      length: variant.length,
      height: variant.height,
      width: variant.width,
      options: variant.options?.map((option) => ({
        id: option.id,
        value: option.value,
      })) || [],
      
      created_at: variant.created_at,
      updated_at: variant.updated_at,
      deleted_at: variant.deleted_at,
    }));

    res.status(200).json({
      limit: 0, // Adjust pagination logic as needed
      offset: 0,
      count: variants.length,
      variants,
    });
  } catch (error) {
    console.error("Error fetching product variants:", error);
    res.status(500).json({
      message: "Failed to fetch product variants",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
