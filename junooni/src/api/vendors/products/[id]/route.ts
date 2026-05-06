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

// export const GET = async (
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) => {
//   const t0 = Date.now();
//   const lap = (label: string) => console.log(`⏱ [${Date.now() - t0}ms] ${label}`);

//   try {
//     const { id } = req.params;
//     lap('START');

//     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
//     const marketplaceModuleService: MarketplaceModuleService =
//       req.scope.resolve(MARKETPLACE_MODULE);
//     lap('services resolved');

//     // ✅ Only fetch vendor_id — no relations, minimal data
//     const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
//       req.auth_context.actor_id,
//       { select: ["id", "vendor_id"] }  // ← no relations: ["vendor"]
//     );
//     lap('vendorAdmin fetched');

//     const { data: [product] } = await query.graph({
//       entity: "product",
//       fields: [
//         "id", "title", "subtitle", "handle", "description", "status",
//         "thumbnail", "discountable", "weight", "length", "width", "height",
//         "material", "origin_country", "metadata",
//         "variants.id", "variants.title", "variants.sku",
//         "variants.allow_backorder", "variants.manage_inventory",
//         "variants.metadata",
//         "variants.prices.amount", "variants.prices.currency_code",
//         "variants.options.option_id", "variants.options.value",
//         "variants.inventory_items.inventory_item_id",
//         "variants.inventory_items.stocked_quantity",
//         "images.id", "images.url", "images.rank", "images.metadata",
//         "options.id", "options.title",
//         "options.values.id", "options.values.value",
//         "categories.id", "categories.name",
//         "sales_channels.id", "sales_channels.name",
//         "vendor.id",
//       ],
//       filters: { id },
//     });
//     lap('query.graph done');

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // ✅ Compare vendor_id directly — no need to load vendor relation
//     if (product.vendor?.id !== vendorAdmin.vendor_id) {
//       return res.status(403).json({
//         message: "You do not have permission to access this product"
//       });
//     }
//     lap('auth check done');

//     const optionMap = new Map(
//       (product.options || []).map((option: any) => [option.id, option])
//     );

//     const formattedProduct = {
//       ...product,
//       sales_channels: product.sales_channels || [],
//       options: product.options?.map((option: any) => ({
//         ...option,
//         values: option.values || [],
//       })) || [],
//       images: product.images || [],
//       variants: product.variants?.map((variant: any) => ({
//         ...variant,
//         images: [],
//         inventory_quantity: variant.inventory_items?.[0]?.stocked_quantity ?? 0,
//         options: variant.options?.map((variantOption: any) => {
//           const resolvedOption = optionMap.get(variantOption.option_id);
//           return {
//             ...variantOption,
//             option: resolvedOption
//               ? { id: resolvedOption.id, title: resolvedOption.title }
//               : undefined,
//           };
//         }) || [],
//       })) || [],
//     };
//     lap('formatting done');

//     console.log(`📦 Returning product: ${product.variants?.length} variants, ${product.images?.length} images`);

//     res.json({ product: formattedProduct });
//     lap('DONE');
//   } catch (error) {
//     console.error('GET product error:', error);
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
//         "variants.inventory_items.stocked_quantity",
//         "images.id", "images.url", "images.rank", "images.metadata",
//         "options.id", "options.title",
//         "options.values.id", "options.values.value",
//         "categories.id", "categories.name",
//         "sales_channels.id", "sales_channels.name",  // ← ADDED
//         "vendor.id",
//       ],
//       filters: { id },
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
  const t0 = Date.now();
  const lap = (label: string) => console.log(`⏱ [${Date.now() - t0}ms] ${label}`);

  try {
    const { id } = req.params;
    lap('START');

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve(MARKETPLACE_MODULE);
    lap('services resolved');

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
      req.auth_context.actor_id,
      { select: ["id", "vendor_id"] }
    );
    lap('vendorAdmin fetched');

    // ── Step 1: Fetch product base + auth fields only (fast) ─────────────
    const { data: [productBase] } = await query.graph({
      entity: "product",
      fields: [
        "id", "title", "subtitle", "handle", "description", "status",
        "thumbnail", "discountable", "weight", "length", "width", "height",
        "material", "origin_country", "metadata",
        "vendor.id",
      ],
      filters: { id },
    });
    lap('product base fetched');

    if (!productBase) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (productBase.vendor?.id !== vendorAdmin.vendor_id) {
      return res.status(403).json({
        message: "You do not have permission to access this product"
      });
    }
    lap('auth check done');

    // ── Step 2: Fetch all relations in parallel (each query is small) ────
    const [
      optionsResult,
      variantsResult,
      imagesResult,
      categoriesResult,
      salesChannelsResult,
    ] = await Promise.all([
      // Options + values — small, fast
      query.graph({
        entity: "product",
        fields: [
          "options.id", "options.title",
          "options.values.id", "options.values.value",
        ],
        filters: { id },
      }),

      // Variants — prices + option values only, NO inventory
      query.graph({
        entity: "product",
        fields: [
          "variants.id", "variants.title", "variants.sku",
          "variants.allow_backorder", "variants.manage_inventory",
          "variants.metadata",
          "variants.prices.amount", "variants.prices.currency_code",
          "variants.options.option_id", "variants.options.value",
        ],
        filters: { id },
      }),

      // Images
      query.graph({
        entity: "product",
        fields: [
          "images.id", "images.url", "images.rank", "images.metadata",
        ],
        filters: { id },
      }),

      // Categories
      query.graph({
        entity: "product",
        fields: ["categories.id", "categories.name"],
        filters: { id },
      }),

      // Sales channels
      query.graph({
        entity: "product",
        fields: ["sales_channels.id", "sales_channels.name"],
        filters: { id },
      }),
    ]);
    lap('parallel relation queries done');

    // Fetch inventory item IDs separately
    const variantIds = (variantsResult.data[0]?.variants || []).map((v: any) => v.id);
    const inventoryResult = variantIds.length > 0
      ? await query.graph({
          entity: "product_variant_inventory_item",
          fields: ["variant_id", "inventory_item_id"],
          filters: { variant_id: variantIds },
        })
      : { data: [] };
    lap('inventory links fetched');

    const inventoryMap = Object.fromEntries(
      (inventoryResult.data || []).map((link: any) => [
        link.variant_id,
        link.inventory_item_id,
      ])
    );

    // ── Assemble response ────────────────────────────────────────────────
    const options = optionsResult.data[0]?.options || [];
    const variants = variantsResult.data[0]?.variants || [];
    const images = imagesResult.data[0]?.images || [];
    const categories = categoriesResult.data[0]?.categories || [];
    const salesChannels = salesChannelsResult.data[0]?.sales_channels || [];

    const optionMap = new Map(
      options.map((option: any) => [option.id, option])
    );

    const formattedProduct = {
      ...productBase,
      options: options.map((option: any) => ({
        ...option,
        values: option.values || [],
      })),
      variants: variants.map((variant: any) => ({
        ...variant,
        images: [],
        inventory_quantity: 0,
        inventory_items: inventoryMap[variant.id]
          ? [{ inventory_item_id: inventoryMap[variant.id] }]
          : [],
        options: (variant.options || []).map((variantOption: any) => {
          const resolvedOption = optionMap.get(variantOption.option_id);
          return {
            ...variantOption,
            option: resolvedOption
              ? { id: resolvedOption.id, title: resolvedOption.title }
              : undefined,
          };
        }),
      })),
      images,
      categories,
      sales_channels: salesChannels,
    };
    lap('formatting done');

    console.log(`📦 Returning product: ${variants.length} variants, ${images.length} images`);

    res.json({ product: formattedProduct });
    lap('DONE');
  } catch (error) {
    console.error('GET product error:', error);
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

    // Use select instead of relations to avoid loading full vendor graph
    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
      req.auth_context.actor_id,
      { select: ["id", "vendor_id"] }
    );

    const { data: [currentProduct] } = await query.graph({
      entity: "product",
      fields: ["id", "vendor.id"],
      filters: { id },
    });

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (currentProduct.vendor?.id !== vendorAdmin.vendor_id) {
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
          vendor_id: vendorAdmin.vendor_id
        },
      },
    });

    const updatedProduct = updatedProducts?.[0];
    if (!updatedProduct) {
      return res.status(404).json({ 
        message: "Product not found or not updated" 
      });
    }

    // Return the workflow result directly — avoids a second query.graph
    res.status(200).json({ product: updatedProduct });
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
      { select: ["id", "vendor_id"] }
    );

    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "vendor.id"],
      filters: { id },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.vendor?.id !== vendorAdmin.vendor_id) {
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