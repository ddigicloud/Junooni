// import {
//   AuthenticatedMedusaRequest,
//   MedusaResponse,
// } from "@medusajs/framework/http";
// import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
// import MarketplaceModuleService from "../../../../modules/marketplace/service";
// import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
// import { 
//   deleteProductsWorkflow, 
//   updateProductsWorkflow 
// } from "@medusajs/medusa/core-flows";
// import {
//   UpdateProductDTO,
// } from "@medusajs/framework/types";

// // ✅ QueryContext import removed — no longer needed

// export const GET = async (
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) => {
//   try {
//     const { id } = req.params;
//     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
//     const marketplaceModuleService: MarketplaceModuleService =
//       req.scope.resolve(MARKETPLACE_MODULE);

//     const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
//       req.auth_context.actor_id,
//       { relations: ["vendor"] }
//     );

//     const { data: [product] } = await query.graph({
//       entity: "product",
//       fields: [
//         "id", "title", "subtitle", "handle", "description", "status",
//         "thumbnail", "discountable", "weight", "length", "width", "height",
//         "material", "origin_country", "metadata",
//         "variants.id", "variants.title", "variants.sku",
//         "variants.allow_backorder", "variants.manage_inventory",
//         "variants.inventory_quantity", "variants.metadata",
//         "variants.prices.amount", "variants.prices.currency_code",
//         "variants.options.option_id", "variants.options.value",
//         "variants.options.option.id", "variants.options.option.title",
//         "variants.inventory_items.inventory_item_id",
//         "variants.images.id", "variants.images.url",
//         "images.id", "images.url", "images.rank", "images.metadata",
//         "options.id", "options.title",
//         "options.values.id", "options.values.value",
//         "categories.id", "categories.name",
//         "vendor.id",
//       ],
//       filters: { id },
//       // ✅ NO context block — calculated_price removed (was causing 81s load)
//     });

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     if (product.vendor?.id !== vendorAdmin.vendor.id) {
//       return res.status(403).json({ 
//         message: "You do not have permission to access this product" 
//       });
//     }

//     const formattedProduct = {
//       ...product,
//       options: product.options?.map((option) => ({
//         ...option,
//         values: option.values || [],
//       })) || [],
//       images: product.images || [],
//       variants: product.variants?.map((variant) => ({
//         ...variant,
//         options: variant.options?.map((variantOption) => ({
//           ...variantOption,
//           option: product.options?.find(
//             (option) => option.id === variantOption.option_id
//           ),
//         })) || [],
//       })) || [],
//     };

//     res.json({ product: formattedProduct });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to fetch product",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };

// export const PUT = async (
//   req: AuthenticatedMedusaRequest<UpdateProductDTO>,
//   res: MedusaResponse
// ) => {
//   try {
//     const { id } = req.params;
//     if (!id) {
//       return res.status(400).json({ message: "Product ID is required" });
//     }

//     if (!req.body || Object.keys(req.body).length === 0) {
//       return res.status(400).json({ message: "Update data is required" });
//     }

//     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
//     const marketplaceModuleService: MarketplaceModuleService =
//       req.scope.resolve(MARKETPLACE_MODULE);

//     const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
//       req.auth_context.actor_id,
//       { relations: ["vendor"] }
//     );

//     // Ownership check — minimal fields only
//     const { data: [currentProduct] } = await query.graph({
//       entity: "product",
//       fields: ["id", "vendor.id"],
//       filters: { id },
//     });

//     if (!currentProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     if (currentProduct.vendor?.id !== vendorAdmin.vendor.id) {
//       return res.status(403).json({ 
//         message: "You do not have permission to update this product" 
//       });
//     }

//     const updateData: UpdateProductDTO = { ...req.body };

//     if (Array.isArray(updateData.images)) {
//       updateData.images = updateData.images.map(image => ({
//         url: image.url,
//         id: image.id
//       }));
//     }

//     const { result: updatedProducts } = await updateProductsWorkflow(req.scope).run({
//       input: {
//         selector: { id },
//         update: updateData,
//         additional_data: {
//           vendor_id: vendorAdmin.vendor.id
//         },
//       },
//     });

//     const updatedProduct = updatedProducts?.[0];
//     if (!updatedProduct) {
//       return res.status(404).json({ 
//         message: "Product not found or not updated" 
//       });
//     }

//     // ✅ NO calculated_price — removed (was causing slow save)
//     const { data: [finalProduct] } = await query.graph({
//       entity: "product",
//       fields: [
//         "id", "title", "subtitle", "handle", "description", "status",
//         "thumbnail", "discountable", "weight", "length", "width", "height",
//         "material", "origin_country", "metadata",
//         "variants.id", "variants.title", "variants.sku",
//         "variants.allow_backorder", "variants.manage_inventory",
//         "variants.inventory_quantity", "variants.metadata",
//         "variants.prices.amount", "variants.prices.currency_code",
//         "variants.options.option_id", "variants.options.value",
//         "variants.options.option.id", "variants.options.option.title",
//         "variants.inventory_items.inventory_item_id",
//         "images.id", "images.url", "images.rank", "images.metadata",
//         "options.id", "options.title",
//         "options.values.id", "options.values.value",
//         "categories.id", "categories.name",
//         "vendor.id",
//       ],
//       filters: { id },
//       // ✅ NO context block
//     });

//     res.status(200).json({ product: finalProduct });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to update product",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };

// export const DELETE = async (
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) => {
//   try {
//     const { id } = req.params;
//     if (!id) {
//       return res.status(400).json({ message: "Product ID is required" });
//     }

//     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
//     const marketplaceModuleService: MarketplaceModuleService =
//       req.scope.resolve(MARKETPLACE_MODULE);

//     const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
//       req.auth_context.actor_id,
//       { relations: ["vendor"] }
//     );

//     const { data: [product] } = await query.graph({
//       entity: "product",
//       fields: ["id", "vendor.id"],
//       filters: { id },
//     });

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     if (product.vendor?.id !== vendorAdmin.vendor.id) {
//       return res.status(403).json({ 
//         message: "You do not have permission to delete this product" 
//       });
//     }

//     await deleteProductsWorkflow(req.scope).run({
//       input: { ids: [id] }
//     });

//     res.status(200).json({
//       message: "Product deleted successfully",
//       id,
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to delete product",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };
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

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params;
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve(MARKETPLACE_MODULE);

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
      req.auth_context.actor_id,
      { relations: ["vendor"] }
    );

    const { data: [product] } = await query.graph({
      entity: "product",
      fields: [
        "id", "title", "subtitle", "handle", "description", "status",
        "thumbnail", "discountable", "weight", "length", "width", "height",
        "material", "origin_country", "metadata",
        "variants.id", "variants.title", "variants.sku",
        "variants.allow_backorder", "variants.manage_inventory",
        "variants.inventory_quantity", "variants.metadata",
        "variants.prices.amount", "variants.prices.currency_code",
        "variants.options.option_id", "variants.options.value",
        "variants.options.option.id", "variants.options.option.title",
        "variants.inventory_items.inventory_item_id",
        "variants.images.id", "variants.images.url",
        "images.id", "images.url", "images.rank", "images.metadata",
        "options.id", "options.title",
        "options.values.id", "options.values.value",
        "categories.id", "categories.name",
        "sales_channels.id", "sales_channels.name",  // ← ADDED
        "vendor.id",
      ],
      filters: { id },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.vendor?.id !== vendorAdmin.vendor.id) {
      return res.status(403).json({ 
        message: "You do not have permission to access this product" 
      });
    }

    const formattedProduct = {
      ...product,
      sales_channels: product.sales_channels || [],  // ← ADDED
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
    res.status(500).json({
      message: "Failed to fetch product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

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
      { relations: ["vendor"] }
    );

    const { data: [currentProduct] } = await query.graph({
      entity: "product",
      fields: ["id", "vendor.id"],
      filters: { id },
    });

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (currentProduct.vendor?.id !== vendorAdmin.vendor.id) {
      return res.status(403).json({ 
        message: "You do not have permission to update this product" 
      });
    }

    const updateData: UpdateProductDTO = { ...req.body };

    if (Array.isArray(updateData.images)) {
      updateData.images = updateData.images.map(image => ({
        url: image.url,
        id: image.id
      }));
    }

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

    const { data: [finalProduct] } = await query.graph({
      entity: "product",
      fields: [
        "id", "title", "subtitle", "handle", "description", "status",
        "thumbnail", "discountable", "weight", "length", "width", "height",
        "material", "origin_country", "metadata",
        "variants.id", "variants.title", "variants.sku",
        "variants.allow_backorder", "variants.manage_inventory",
        "variants.inventory_quantity", "variants.metadata",
        "variants.prices.amount", "variants.prices.currency_code",
        "variants.options.option_id", "variants.options.value",
        "variants.options.option.id", "variants.options.option.title",
        "variants.inventory_items.inventory_item_id",
        "images.id", "images.url", "images.rank", "images.metadata",
        "options.id", "options.title",
        "options.values.id", "options.values.value",
        "categories.id", "categories.name",
        "sales_channels.id", "sales_channels.name",  // ← ADDED
        "vendor.id",
      ],
      filters: { id },
    });

    res.status(200).json({ product: finalProduct });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

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
      { relations: ["vendor"] }
    );

    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "vendor.id"],
      filters: { id },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.vendor?.id !== vendorAdmin.vendor.id) {
      return res.status(403).json({ 
        message: "You do not have permission to delete this product" 
      });
    }

    await deleteProductsWorkflow(req.scope).run({
      input: { ids: [id] }
    });

    res.status(200).json({
      message: "Product deleted successfully",
      id,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};