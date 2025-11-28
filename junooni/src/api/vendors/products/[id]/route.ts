import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import MarketplaceModuleService from "../../../../modules/marketplace/service";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
import { 
  deleteProductsWorkflow, 
  updateProductsWorkflow 
} from "@medusajs/medusa/core-flows";
import {
  UpdateProductDTO,
} from "@medusajs/framework/types";
import { QueryContext } from "@medusajs/framework/utils";

// ✅ OPTIMIZED: Query single product by ID, then verify ownership
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params;
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve(MARKETPLACE_MODULE);

    // Get vendor admin
    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
      req.auth_context.actor_id,
      {
        relations: ["vendor"],
      }
    );

    // 🚀 OPTIMIZED: Query ONLY the product we need by ID
    const { data: [product] } = await query.graph({
      entity: "product",
      fields: [
        "*",
        "variants.*",
        "variants.options.*",
        "variants.calculated_price.*",
        "variants.inventory_items.*",
        "variants.inventory_items.inventory_item_id",
        "variants.inventory_items.stocked_quantity",
        "images.*",
        "options.*",
        // "options.metadata.*",
        "options.values.*",
        "categories.*",
        // "brand.*",
        "tags.*",
        "vendor.*", // Include vendor to verify ownership
        //"size_chart.*",
        "metadata",
      ],
      filters: {
        id: id, // Only fetch this specific product
      },
      context: {
        variants: {
          calculated_price: QueryContext({
            currency_code: "inr"
          })
        }
      },
    });

    // Check if product exists
    if (!product) {
      return res.status(404).json({ 
        message: "Product not found" 
      });
    }

    // 🔒 Verify ownership
    if (product.vendor?.id !== vendorAdmin.vendor.id) {
      return res.status(403).json({ 
        message: "You do not have permission to access this product" 
      });
    }

    // Enrich the product data
    const formattedProduct = {
      ...product,
      options: product.options?.map((option) => ({
        ...option,
        values: option.values || [],
      })) || [],
      images: product.images || [],
      variants: product.variants?.map((variant) => ({
        ...variant,
        options: variant.options?.map((variantOption) => ({
          ...variantOption,
          option: product.options?.find(
            (option) => option.id === variantOption.option_id
          ),
        })) || [],
      })) || [],
    };

    res.json({ product: formattedProduct });
  } catch (error) {
    //console.error("Error fetching product:", error);
    res.status(500).json({
      message: "Failed to fetch product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ✅ OPTIMIZED PUT
export const PUT = async (
  req: AuthenticatedMedusaRequest<UpdateProductDTO>,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Update data is required" });
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve(MARKETPLACE_MODULE);

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
      req.auth_context.actor_id,
      {
        relations: ["vendor"],
      }
    );

    // 🚀 OPTIMIZED: Query ONLY this product
    const { data: [currentProduct] } = await query.graph({
      entity: "product",
      fields: [
        "*", 
        "images.*",
        "variants.*",
        "options.*",
        "options.values.*",
        "options.metadata.*",
        "vendor.*", // Include vendor for ownership check
        "metadata"
      ],
      filters: {
        id: id,
      },
    });

    if (!currentProduct) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // 🔒 Verify ownership
    if (currentProduct.vendor?.id !== vendorAdmin.vendor.id) {
      return res.status(403).json({
        message: "You do not have permission to update this product"
      });
    }

    // Handle image updates properly
    const updateData: UpdateProductDTO = {
      ...req.body,
    };

    if (Array.isArray(updateData.images)) {
      updateData.images = updateData.images.map(image => ({
        url: image.url,
        id: image.id
      }));
    }

    // Run the update workflow
    const { result: updatedProducts } = await updateProductsWorkflow(req.scope).run({
      input: {
        selector: { id },
        update: updateData,
        additional_data: {
          vendor_id: vendorAdmin.vendor.id
        },
      },
    });

    const updatedProduct = updatedProducts?.[0];
    if (!updatedProduct) {
      return res.status(404).json({ 
        message: "Product not found or not updated" 
      });
    }

    // 🚀 OPTIMIZED: Fetch ONLY the updated product
    const { data: [finalProduct] } = await query.graph({
      entity: "product",
      fields: [
        "*",
        "variants.*",
        "variants.options.*",
        "variants.calculated_price.*",
        "variants.inventory_items.*",
        "variants.inventory_items.inventory_item_id",
        "variants.inventory_items.stocked_quantity",
        "images.*",
        "options.*",
        "options.metadata.*",
        "options.values.*",
        "categories.*",
        "brand.*",
        "tags.*",
        "vendor.*",
        "size_chart.*",
        
        "metadata"
      ],
      filters: {
        id: id,
      },
      context: {
        variants: {
          calculated_price: QueryContext({ 
            currency_code: "inr" 
          }),
        },
      },
    });

    res.status(200).json({ product: finalProduct });
  } catch (error) {
    //console.error("Error updating product:", error);
    res.status(500).json({
      message: "Failed to update product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ✅ OPTIMIZED DELETE
export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve(MARKETPLACE_MODULE);

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
      req.auth_context.actor_id,
      {
        relations: ["vendor"],
      }
    );

    // 🚀 OPTIMIZED: Query ONLY this product
    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "vendor.*"],
      filters: {
        id: id,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // 🔒 Verify ownership
    if (product.vendor?.id !== vendorAdmin.vendor.id) {
      return res.status(403).json({
        message: "You do not have permission to delete this product"
      });
    }

    // Run the delete workflow
    await deleteProductsWorkflow(req.scope).run({
      input: {
        ids: [id]
      }
    });

    res.status(200).json({
      message: "Product deleted successfully",
      id: id
    });

  } catch (error) {
    //console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Failed to delete product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};