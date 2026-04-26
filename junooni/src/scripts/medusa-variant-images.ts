/**
 * Migration Script: Move variant images from metadata to native Medusa v2 variant.images
 *
 * Place in Medusa backend root (next to medusa-config.ts).
 *
 * Dry run (default — safe, no writes):
 *   npx medusa exec ./migrate-variant-images.ts
 *
 * Live run:
 *   DRY_RUN=false npx medusa exec ./migrate-variant-images.ts
 *
 * ── WHY THE PREVIOUS VERSIONS FAILED ─────────────────────────────────────────
 *
 * Version 1 (original):
 *   productModuleService.updateVariants()  ← method does not exist
 *
 * Version 2 (first fix attempt):
 *   productModuleService.updateProductVariants([{ id, images: [{id}] }])
 *   ← Writes variant row fields but does NOT touch the pivot table.
 *     Silently does nothing for the images relation on existing variants.
 *
 * Version 3 (this file) — CORRECT:
 *   productModuleService.addImageToVariant([{ variant_id, image_id }])
 *   ← The actual method that writes to product_variant_product_image pivot table.
 *     Confirmed from @medusajs/product v2.13.6 source code.
 *     Type: VariantImageInput = { image_id: string; variant_id: string }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { MedusaContainer } from '@medusajs/framework/types';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const DRY_RUN = process.env.DRY_RUN !== 'false'; // default: dry run ON
const BATCH_SIZE = 50;
const DELAY_MS = 50;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function log(msg: string) { console.log(`[${new Date().toISOString()}] ${msg}`); }
function warn(msg: string) { console.warn(`⚠️  ${msg}`); }
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ─── FIND IMAGE ID FROM PRODUCT IMAGES BY URL ────────────────────────────────
function findImageIdByUrl(productImages: any[], url: string): string | null {
  if (!url) return null;
  const exact = productImages.find((img: any) => img.url === url);
  if (exact) return exact.id;
  const filename = url.split('/').pop();
  if (filename) {
    const byFilename = productImages.find((img: any) => img.url.split('/').pop() === filename);
    if (byFilename) return byFilename.id;
  }
  return null;
}

// ─── GET COLOR OPTION VALUE FROM VARIANT ─────────────────────────────────────
function getColorValue(variant: any): string | null {
  if (!variant.options || !Array.isArray(variant.options)) return null;
  const colorOpt = variant.options.find(
    (o: any) =>
      o.option?.title?.toLowerCase() === 'color' ||
      o.option?.title?.toLowerCase() === 'colour'
  );
  return colorOpt?.value || null;
}

// ─── CHECK IF VARIANT ALREADY MIGRATED ───────────────────────────────────────
function isAlreadyMigrated(variant: any): boolean {
  if (!variant.images || !Array.isArray(variant.images) || variant.images.length === 0) {
    return false;
  }
  return variant.images.some(
    (img: any) =>
      Array.isArray(img.variants) &&
      img.variants.some((v: any) => v.id === variant.id)
  );
}

// ─── PARSE METADATA IMAGE SOURCES ────────────────────────────────────────────
interface MetadataImageEntry {
  url: string;
  imageId: string;
  optionValue?: string;
}

function parseMetadataImages(variant: any): MetadataImageEntry[] {
  const metadata = variant.metadata || {};
  const results: MetadataImageEntry[] = [];
  const seen = new Set<string>();

  const addIfNew = (entry: MetadataImageEntry) => {
    const key = entry.imageId || entry.url;
    if (key && !seen.has(key)) { seen.add(key); results.push(entry); }
  };

  // Source 1: option_images (newest)
  if (metadata.option_images) {
    try {
      const parsed = typeof metadata.option_images === 'string'
        ? JSON.parse(metadata.option_images) : metadata.option_images;
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          if (item.url && item.imageId)
            addIfNew({ url: item.url, imageId: item.imageId, optionValue: item.option_value });
        });
      }
    } catch { warn(`Failed to parse option_images for variant ${variant.id}`); }
  }

  // Source 2: color_images (fallback)
  if (metadata.color_images) {
    try {
      const parsed = typeof metadata.color_images === 'string'
        ? JSON.parse(metadata.color_images) : metadata.color_images;
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          if (item.url && item.imageId)
            addIfNew({ url: item.url, imageId: item.imageId, optionValue: item.color });
        });
      }
    } catch { warn(`Failed to parse color_images for variant ${variant.id}`); }
  }

  // Source 3: variant_image_ids + variant_images (oldest)
  if (metadata.variant_image_ids) {
    try {
      const ids = typeof metadata.variant_image_ids === 'string'
        ? JSON.parse(metadata.variant_image_ids) : metadata.variant_image_ids;
      const urls = metadata.variant_images
        ? (typeof metadata.variant_images === 'string'
          ? JSON.parse(metadata.variant_images) : metadata.variant_images)
        : [];
      if (Array.isArray(ids)) {
        ids.forEach((imageId: string, idx: number) => {
          if (imageId) addIfNew({ url: urls[idx] || '', imageId });
        });
      }
    } catch { warn(`Failed to parse variant_image_ids for variant ${variant.id}`); }
  }

  return results;
}

// ─── CORRECT WRITE: addImageToVariant ────────────────────────────────────────
async function associateImagesToVariant(
  container: MedusaContainer,
  variantId: string,
  imageIds: string[],
  thumbnailUrl: string | null
): Promise<void> {
  if (DRY_RUN) {
    log(`    [DRY RUN] addImageToVariant: ${imageIds.length} image(s) → variant ${variantId}`);
    log(`    [DRY RUN] image_ids: ${imageIds.join(', ')}`);
    if (thumbnailUrl) log(`    [DRY RUN] thumbnail: ${thumbnailUrl}`);
    return;
  }

  const productModuleService = container.resolve('product') as any;

  // THE CORRECT METHOD — writes to product_variant_product_image pivot table
  await productModuleService.addImageToVariant(
    imageIds.map((image_id) => ({ image_id, variant_id: variantId }))
  );

  // Set thumbnail — this IS just a plain field on the variant row
  if (thumbnailUrl) {
    await productModuleService.updateProductVariants(
      variantId,
      { thumbnail: thumbnailUrl }
    );
  }
}

// ─── PROCESS A SINGLE VARIANT ────────────────────────────────────────────────
async function processVariant(
  container: MedusaContainer,
  product: any,
  variant: any
): Promise<{ skipped: boolean; migrated: boolean; alreadyDone?: boolean; error?: string }> {
  const label = `${product.title} → ${variant.title} (${variant.id})`;

  if (isAlreadyMigrated(variant)) {
    log(`  ✅ Already migrated: ${label}`);
    return { skipped: false, migrated: false, alreadyDone: true };
  }

  // ── Path A: metadata images ───────────────────────────────────────────────
  const metadataImages = parseMetadataImages(variant);

  if (metadataImages.length > 0) {
    log(`  🔄 Migrating ${metadataImages.length} metadata image(s) for: ${label}`);

    const resolvedImageIds: string[] = [];
    for (const entry of metadataImages) {
      if (entry.imageId && entry.imageId.startsWith('img_')) {
        const exists = product.images.find((img: any) => img.id === entry.imageId);
        if (exists) { resolvedImageIds.push(entry.imageId); continue; }
      }
      const resolvedId = findImageIdByUrl(product.images, entry.url);
      if (resolvedId) {
        resolvedImageIds.push(resolvedId);
      } else {
        warn(`    Could not resolve image: ${entry.url}`);
      }
    }

    const uniqueImageIds = [...new Set(resolvedImageIds)];
    if (uniqueImageIds.length === 0) {
      warn(`  ❌ No resolvable image IDs for: ${label}`);
      return { skipped: false, migrated: false, error: 'No resolvable image IDs' };
    }

    const frontEntry = metadataImages.find(e => e.url.toLowerCase().includes('front')) || metadataImages[0];
    const thumbnailImageId = findImageIdByUrl(product.images, frontEntry.url) || uniqueImageIds[0];
    const thumbnailImage = product.images.find((img: any) => img.id === thumbnailImageId);
    const thumbnailUrl = thumbnailImage?.url || null;

    log(`    Resolved ${uniqueImageIds.length} image ID(s), thumbnail: ${thumbnailUrl}`);

    try {
      await associateImagesToVariant(container, variant.id, uniqueImageIds, thumbnailUrl);
      return { skipped: false, migrated: true };
    } catch (e: any) {
      return { skipped: false, migrated: false, error: e.message };
    }
  }

  // ── Path B: URL-based color matching (no metadata) ────────────────────────
  const colorValue = getColorValue(variant);
  if (!colorValue) {
    log(`  ⏭️  No image data or color found for: ${label}`);
    return { skipped: true, migrated: false };
  }

  const colorKey = colorValue.toLowerCase().replace(/\s+/g, '_');
  const colorDash = colorValue.toLowerCase().replace(/\s+/g, '-');

  const matchingImages = product.images.filter((img: any) => {
    const u = img.url.toLowerCase();
    return u.includes(colorKey) || u.includes(colorDash);
  });

  if (matchingImages.length === 0) {
    log(`  ⏭️  No URL-matched images for color "${colorValue}": ${label}`);
    return { skipped: true, migrated: false };
  }

  log(`  🎨 URL-matched ${matchingImages.length} images for "${colorValue}": ${label}`);
  const imageIds = matchingImages.map((img: any) => img.id);
  const frontImage = matchingImages.find((img: any) => img.url.toLowerCase().includes('front')) || matchingImages[0];

  try {
    await associateImagesToVariant(container, variant.id, imageIds, frontImage?.url || null);
    return { skipped: false, migrated: true };
  } catch (e: any) {
    return { skipped: false, migrated: false, error: e.message };
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default async function migrateVariantImages({
  container,
}: {
  container: MedusaContainer;
}): Promise<void> {
  log('='.repeat(60));
  log('JUNOONI: Variant Image Migration (v3 — correct API)');
  log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : '⚡ LIVE — writes to DB'}`);
  log('='.repeat(60));

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const stats = { totalProducts: 0, totalVariants: 0, alreadyDone: 0, migrated: 0, skipped: 0, errors: 0 };
  const errorLog: { product: string; variant: string; error: string }[] = [];

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    log(`\nFetching products (offset: ${offset})...`);

    const { data: products } = await query.graph({
      entity: 'product',
      fields: [
        'id', 'title', 'handle',
        'images.id', 'images.url', 'images.rank',
        'variants.id', 'variants.title', 'variants.thumbnail', 'variants.metadata',
        'variants.images.id',
        'variants.images.url',
        'variants.images.variants.id', // detect already-migrated via pivot
        'variants.options.value',
        'variants.options.option_id',
        'variants.options.option.id',
        'variants.options.option.title',
      ],
      pagination: { take: BATCH_SIZE, skip: offset },
    });

    if (!products || products.length === 0) { hasMore = false; break; }

    stats.totalProducts += products.length;
    log(`Processing ${products.length} product(s)...`);

    for (const product of products) {
      log(`\n→ Product: "${product.title}" (${product.id})`);
      if (!product.variants?.length) { log(`  No variants, skipping.`); continue; }
      if (!product.images?.length)   { log(`  No product images, skipping.`); continue; }

      for (const variant of product.variants) {
        stats.totalVariants++;
        const result = await processVariant(container, product, variant);

        if (result.alreadyDone)      stats.alreadyDone++;
        else if (result.skipped)     stats.skipped++;
        else if (result.migrated)  { stats.migrated++; log(`    ✅ Migrated`); }
        else if (result.error)     {
          stats.errors++;
          errorLog.push({
            product: `${product.title} (${product.id})`,
            variant: `${variant.title} (${variant.id})`,
            error: result.error,
          });
          warn(`    ❌ Error: ${result.error}`);
        }

        await sleep(DELAY_MS);
      }
    }

    hasMore = products.length >= BATCH_SIZE;
    if (hasMore) offset += BATCH_SIZE;
  }

  log('\n' + '='.repeat(60));
  log('MIGRATION SUMMARY');
  log('='.repeat(60));
  log(`Total products processed : ${stats.totalProducts}`);
  log(`Total variants processed : ${stats.totalVariants}`);
  log(`Already migrated (skip)  : ${stats.alreadyDone}`);
  log(`Successfully migrated    : ${stats.migrated}`);
  log(`Skipped (no data)        : ${stats.skipped}`);
  log(`Errors                   : ${stats.errors}`);

  if (errorLog.length > 0) {
    log('\nERRORS DETAIL:');
    errorLog.forEach(e => {
      log(`  Product : ${e.product}`);
      log(`  Variant : ${e.variant}`);
      log(`  Error   : ${e.error}`);
    });
  }

  if (DRY_RUN) {
    log('\n⚠️  DRY RUN complete — no changes were made.');
    log('To apply: DRY_RUN=false npx medusa exec ./migrate-variant-images.ts');
  } else {
    log(`\n✅ Migration complete. ${stats.migrated} variant(s) updated.`);
  }
}