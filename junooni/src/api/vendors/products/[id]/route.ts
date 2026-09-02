import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
//import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import MarketplaceModuleService from "../../../../modules/marketplace/service";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
import {
  deleteProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import { UpdateProductDTO } from "@medusajs/framework/types";
import fs from "fs";
import path from "path";
import { deleteArtworkWorkflow } from "../../../../workflows/artwork/delete-artwork";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

// ── Resolve vendor_id from actor_id ──────────────────────────────────────────
// actor_id is always vendor_admin.id — vendor_id is a plain column, no join needed
async function resolveVendorId(
  query: any,
  actorId: string
): Promise<string | null> {
  const {
    data: [va],
  } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "vendor_id"],
    filters: { id: actorId },
  });
  return va?.vendor_id ?? null;
}

// ── GET /vendors/products/:id ─────────────────────────────────────────────────

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const t0 = Date.now();
  const lap = (label: string) =>
    console.log(`⏱ [${Date.now() - t0}ms] ${label}`);

  try {
    const { id } = req.params;
    lap("START");

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    lap("services resolved");

    // ✅ Use resolveVendorId — same pattern as vendors/me
    const vendorId = await resolveVendorId(query, req.auth_context.actor_id);
    if (!vendorId) {
      return res.status(403).json({
        message: "Failed to fetch product",
        error: `VendorAdmin not found for actor_id: ${req.auth_context.actor_id}`,
      });
    }
    lap("vendorId resolved");

    // ── Step 1: Fetch product base + auth fields only ─────────────────────
    const {
      data: [productBase],
    } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "subtitle",
        "handle",
        "description",
        "status",
        "thumbnail",
        "discountable",
        "weight",
        "length",
        "width",
        "height",
        "material",
        "origin_country",
        "metadata",
        "vendor.id",
      ],
      filters: { id },
    });
    lap("product base fetched");

    if (!productBase) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (productBase.vendor?.id !== vendorId) {
      return res.status(403).json({
        message: "You do not have permission to access this product",
      });
    }
    lap("auth check done");

    // ── Step 2: Fetch all relations in parallel ───────────────────────────
    const [
      optionsResult,
      variantsResult,
      imagesResult,
      categoriesResult,
      salesChannelsResult,
    ] = await Promise.all([
      query.graph({
        entity: "product",
        fields: [
          "options.id",
          "options.title",
          "options.values.id",
          "options.values.value",
        ],
        filters: { id },
      }),

      query.graph({
        entity: "product",
        fields: [
          "variants.id",
          "variants.title",
          "variants.sku",
          "variants.allow_backorder",
          "variants.manage_inventory",
          "variants.metadata",
          "variants.prices.amount",
          "variants.prices.currency_code",
          "variants.options.option_id",
          "variants.options.value",
        ],
        filters: { id },
      }),

      query.graph({
        entity: "product",
        fields: ["images.id", "images.url", "images.rank", "images.metadata"],
        filters: { id },
      }),

      query.graph({
        entity: "product",
        fields: ["categories.id", "categories.name"],
        filters: { id },
      }),

      query.graph({
        entity: "product",
        fields: ["sales_channels.id", "sales_channels.name"],
        filters: { id },
      }),
    ]);
    lap("parallel relation queries done");

    // ── Fetch inventory item IDs ──────────────────────────────────────────
    const variantIds = (variantsResult.data[0]?.variants || []).map(
      (v: any) => v.id
    );

    const inventoryResult =
      variantIds.length > 0
        ? await query.graph({
            entity: "product_variant_inventory_item",
            fields: ["variant_id", "inventory_item_id"],
            filters: { variant_id: variantIds },
          })
        : { data: [] };
    lap("inventory links fetched");

    const inventoryMap = Object.fromEntries(
      (inventoryResult.data || []).map((link: any) => [
        link.variant_id,
        link.inventory_item_id,
      ])
    );

    // ── Fetch stocked quantities ──────────────────────────────────────────
    const inventoryItemIds = Object.values(inventoryMap) as string[];
    let stockedQuantityMap: Record<string, number> = {};

    if (inventoryItemIds.length > 0) {
      const { data: locationLevels } = await query.graph({
        entity: "inventory_level",
        fields: ["inventory_item_id", "stocked_quantity"],
        filters: { inventory_item_id: inventoryItemIds },
      });

      stockedQuantityMap = (locationLevels || []).reduce(
        (acc: Record<string, number>, level: any) => {
          const itemId = level.inventory_item_id;
          acc[itemId] = (acc[itemId] || 0) + level.stocked_quantity;
          return acc;
        },
        {}
      );
    }
    lap("inventory levels fetched");

    // ── Assemble response ─────────────────────────────────────────────────
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
        inventory_quantity: inventoryMap[variant.id]
          ? (stockedQuantityMap[inventoryMap[variant.id]] ?? 0)
          : 0,
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
    lap("formatting done");

    console.log(
      `📦 Returning product: ${variants.length} variants, ${images.length} images`
    );

    res.json({ product: formattedProduct });
    lap("DONE");
  } catch (error) {
    console.error("GET product error:", error);
    res.status(500).json({
      message: "Failed to fetch product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ── PUT /vendors/products/:id ─────────────────────────────────────────────────

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

    // ✅ Use resolveVendorId — same pattern as vendors/me
    const vendorId = await resolveVendorId(query, req.auth_context.actor_id);
    if (!vendorId) {
      return res.status(403).json({
        message: "Failed to update product",
        error: `VendorAdmin not found for actor_id: ${req.auth_context.actor_id}`,
      });
    }

    const {
      data: [currentProduct],
    } = await query.graph({
      entity: "product",
      fields: ["id", "vendor.id"],
      filters: { id },
    });

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (currentProduct.vendor?.id !== vendorId) {
      return res.status(403).json({
        message: "You do not have permission to update this product",
      });
    }

    const updateData: UpdateProductDTO = { ...req.body };

    if (Array.isArray(updateData.images)) {
      updateData.images = updateData.images.map((image) => ({
        url: image.url,
        id: image.id,
      }));
    }

    const { result: updatedProducts } = await updateProductsWorkflow(
      req.scope
    ).run({
      input: {
        selector: { id },
        update: updateData,
        additional_data: {
          vendor_id: vendorId,
        },
      },
    });

    const updatedProduct = updatedProducts?.[0];
    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found or not updated",
      });
    }

    res.status(200).json({ product: updatedProduct });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ── DELETE /vendors/products/:id ──────────────────────────────────────────────

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const query      = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const pgClient   = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const fileModule = req.scope.resolve(Modules.FILE);

  const log = (msg: string) =>
    console.log(`[DELETE /vendors/products/${id}] ${msg}`);
  const errors: string[] = [];

  const PRODUCT_ARTWORK_TABLE = "product_product_vendorartworkmodule_vendor_artwork";
  const VENDOR_PRODUCT_TABLE  = "marketplacemodule_vendor_product_product";

  try {
    // ── Auth: resolve vendor and verify ownership ─────────────────────────
    const vendorId = await resolveVendorId(query, req.auth_context.actor_id);
    if (!vendorId) {
      return res.status(403).json({ message: "Vendor not found" });
    }

    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "title", "vendor.id"],
      filters: { id },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.vendor?.id !== vendorId) {
      return res.status(403).json({ message: "You do not have permission to delete this product" });
    }

    log(`Deleting "${product.title}"…`);

    // ── 1. Delete image files from storage ───────────────────────────────
    log("Fetching image records…");
    try {
      const imageRows = await pgClient.raw(
        `SELECT id, url FROM "image" WHERE product_id = ? AND deleted_at IS NULL`,
        [id]
      );
      const images: { id: string; url: string }[] = imageRows.rows ?? imageRows[0] ?? [];
      log(`Found ${images.length} image(s).`);

      for (const img of images) {
        if (!img.url) continue;
        try {
          const fileKey = img.url.split("/").pop();
          if (fileKey) {
            try {
              await fileModule.deleteFiles([{ fileKey }]);
              log(`Deleted from storage: ${fileKey}`);
            } catch {
              const localPath = path.join(process.cwd(), "static", fileKey);
              if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
                log(`Deleted local file: ${fileKey}`);
              }
            }
          }
        } catch (err: any) {
          errors.push(`Failed to delete image ${img.id}: ${err.message}`);
        }
      }
    } catch (err: any) {
      errors.push(`Failed to fetch images: ${err.message}`);
    }

    // ── 2. Delete linked artworks ────────────────────────────────────────
    log("Fetching linked artworks…");
    try {
      const artworkRows = await pgClient.raw(
        `SELECT vendor_artwork_id FROM "${PRODUCT_ARTWORK_TABLE}"
         WHERE product_id = ? AND deleted_at IS NULL`,
        [id]
      );
      const artworkIds: string[] = (artworkRows.rows ?? artworkRows[0] ?? [])
        .map((r: any) => r.vendor_artwork_id)
        .filter(Boolean);

      log(`Found ${artworkIds.length} artwork(s).`);

      for (const artworkId of artworkIds) {
        try {
          await deleteArtworkWorkflow(req.scope).run({ input: { id: artworkId } });
          log(`Deleted artwork ${artworkId}.`);
        } catch (err: any) {
          log(`Artwork workflow failed for ${artworkId}: ${err.message} — manual cleanup…`);
          try {
            const mediaRows = await pgClient.raw(
              `SELECT "fileId" FROM "vendor_artwork_media" WHERE vendor_artwork_id = ?`,
              [artworkId]
            );
            const medias = mediaRows.rows ?? mediaRows[0] ?? [];
            for (const media of medias) {
              if (media.fileId) {
                try {
                  await fileModule.deleteFiles([{ fileKey: media.fileId }]);
                } catch {
                  const localPath = path.join(process.cwd(), "static", media.fileId);
                  if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
                }
              }
            }
            await pgClient.raw(`DELETE FROM "vendor_artwork_media" WHERE vendor_artwork_id = ?`, [artworkId]);
            await pgClient.raw(`DELETE FROM "vendor_artwork" WHERE id = ?`, [artworkId]);
            log(`Manually cleaned up artwork ${artworkId}.`);
          } catch (manualErr: any) {
            errors.push(`Failed to delete artwork ${artworkId}: ${manualErr.message}`);
          }
        }
      }

      await pgClient.raw(
        `DELETE FROM "${PRODUCT_ARTWORK_TABLE}" WHERE product_id = ?`,
        [id]
      );
      log("Artwork link rows removed.");
    } catch (err: any) {
      errors.push(`Failed during artwork deletion: ${err.message}`);
    }

    // ── 3. Delete vendor-product link rows ───────────────────────────────
    log("Removing vendor-product links…");
    try {
      await pgClient.raw(
        `DELETE FROM "${VENDOR_PRODUCT_TABLE}" WHERE product_id = ?`,
        [id]
      );
      log("Vendor-product links removed.");
    } catch (err: any) {
      errors.push(`Failed to remove vendor-product links: ${err.message}`);
    }

    // ── 4. Delete the product ─────────────────────────────────────────────
    log("Deleting product record…");
    try {
      const productModuleService = req.scope.resolve(Modules.PRODUCT);
      await productModuleService.deleteProducts([id]);
      log("Product deleted.");
    } catch (err: any) {
      errors.push(`Failed to delete product record: ${err.message}`);
      return res.status(500).json({
        message: "Product record could not be deleted. Partial cleanup may have occurred.",
        errors,
      });
    }

    // ── 5. Respond ────────────────────────────────────────────────────────
    if (errors.length > 0) {
      return res.status(207).json({
        message: "Product deleted but some files could not be fully cleaned up.",
        deleted: true,
        errors,
      });
    }

    return res.status(200).json({
      message: "Product and all associated files permanently deleted.",
      deleted: true,
      id,
    });

  } catch (error: any) {
    console.error("[vendor DELETE product] Unexpected error:", error);
    return res.status(500).json({
      message: "Failed to delete product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};