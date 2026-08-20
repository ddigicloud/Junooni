/**
 * seed-tote-bag-non-zipper.ts
 *
 * Creates the "Tote Bag Non Zipper" product in junooni-blanks PayloadCMS.
 *
 * USAGE (run from junooni-blanks project root):
 *   npx tsx src/scripts/seed-tote-bag-non-zipper.ts
 *
 * ⚠️  BEFORE RUNNING:
 *   1. Upload the 3 display images to PayloadCMS media collection and
 *      replace MEDIA_IDS below with the actual Payload media doc IDs.
 *   2. Confirm the category IDs for Home & Living / Bags / Tote Bags
 *      in your Blanks CMS and replace CATEGORY_IDS below.
 *   3. Check your products collection slug in payload.config.ts —
 *      default assumed here is 'products'.
 */

import { config as loadEnv } from 'dotenv'
import path from 'path'

// Load .env BEFORE anything else, same as regenerate-media-sizes.ts
loadEnv({ path: path.resolve(process.cwd(), '.env') })

console.log('CWD:', process.cwd())
console.log('PAYLOAD_SECRET loaded:', !!process.env.PAYLOAD_SECRET)

// ─── ⚠️  CONFIGURE THESE BEFORE RUNNING ────────────────────────────────────

// ⚠️  Media IDs left null — upload images to Blanks CMS media first,
// then update these IDs and re-run to attach images to the product.
// Images needed:
//   Junooni_non-zipper_tote_bags.webp    → displayImage1
//   Junooni_non-zipper_tote_bags-1.webp  → displayImage2
//   Junooni_non-zipper_tote_bags-2.webp  → displayImage3
//   junooni_totebag_nonzip.webp          → mockupPhoto (studio mockup)
const MEDIA_IDS = {
  displayImage1: null,      // set after uploading to Blanks CMS media
  displayImage2: null,
  displayImage3: null,
  mockupPhoto: null,        // set after uploading to Blanks CMS media
}

// Category doc IDs confirmed from Blanks CMS admin
// "Home and living" = 4  (confirmed from /junooni/collections/categories/4)
// Bags and Tote Bags don't exist yet — using only Home and living for now
const CATEGORY_IDS = {
  homeAndLiving: 4,
}

// Collection slug from BlankProducts.ts — common values to try if this fails:
//   'blank-products'  (Payload default kebab-case from class name BlankProducts)
//   'blanks-products'
//   'blankProducts'
// Run: grep -r "slug:" src/collections/BlankProducts.ts  to confirm
const PRODUCTS_COLLECTION = 'blank-products'

// ─── Product Data ────────────────────────────────────────────────────────────

function buildProductData() {
  return {
    name: 'Tote Bag Non Zipper',
    slug: 'tote-bag-non-zipper',
    status: 'active',
    productType: 'accessories_tote_bag',

    categories: [
      CATEGORY_IDS.homeAndLiving,
    ],

    tags: [],
    brand: 'Qikink',
    brandSku: '',
    sku: 'JUNO-HL-QK-tb-DF',
    'Manufacturer sku': 'UTbNz',

    vendorInfo: {
      supplier: 'qikink',
      supplierProductId: null,
      countryOrigin: null,
    },

    sourcing: {
      minOrderQty: null,
      leadTimeDays: '1-2',
      shipTimeDays: '4-7',
      rushAvailable: null,
      rushLeadTimeDays: null,
    },

    cost: 110,
    'GST Cost': 18,

    pricing: {
      markupType: null,
      markupValue: null,
      suggestedRetail: 499,
    },

    pricingTiers: [],

    additionalCosts: {
      printingCostPerArea: null,
      printingGST: null,
      setupFee: null,
      rushSurcharge: null,
    },

    description: `
This <b>Tote Bags</b> are a modern, fashion-forward accessory suitable for both men and women and a practical choice for adopting an eco-friendly lifestyle. Designed to replace single-use plastic bags, they're ideal for daily use, shopping, and casual carry.

Crafted from <b>100% cotton canvas fabric</b>, this <b>non-zipper tote bag</b> features <b>double-stitched side seams</b> for added strength and <b>long self-handles</b> for comfortable carrying. The <b>open-top design</b> offers easy access while maintaining a clean, minimal look. Printed using <b>on-demand, low-pigment printing</b> techniques, the tote delivers a smooth finish suitable for custom designs.

✨ <b>Eco-friendly style. Everyday utility. Clean design.</b>
`,

    features: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          'Canvas Tote',
          '100% Cotton',
          'Double Stitched',
          'Long Handle',
          'Eco-Friendly Nature',
          'Stylish',
        ].map((text) => ({
          type: 'paragraph',
          format: 'left',
          indent: 0,
          version: 1,
          children: [
            {
              mode: 'normal',
              text,
              type: 'text',
              style: '',
              detail: 0,
              format: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          textStyle: '',
          textFormat: 0,
        })),
        direction: 'ltr',
      },
    },

    HSNCode: '420222',

    materials: {
      primary: 'Cotton',
      weight: '240',
      construction: null,
      finish: '',
      efabType: 'cotton',
      fabricWeight: null,
      surfaceTexture: 'smooth',
      stretchability: null,
      transparency: null,
      reflectivity: null,
    },

    careInstructions: [],

    physicalDimensions: {
      widthInches: null,
      heightInches: null,
      depthInches: null,
      diameter: null,
      units: 'inches',
    },

    shippingInfo: {
      weight: 150,
      shippingDimensions: '10x10x10',
      shippingCharges: '50',
      shippingLocationID: 'sloc_01K8FPYKGJ9N6345V23WJH3Z0N',
      shippingProfileID: 'sp_01K45T18TJN18C8QR0PJ48SB4R',
      packageType: 'poly_mailer',
    },

    colorOptions: [
      {
        colorName: 'White',
        colorHex: '#ffffff',
        colorSku: '-Wh',
        isPrimary: true,
        fabricInteraction: {
          absorptionRate: 0.1,
          blendMode: 'multiply',
          colorShift: { hueShift: 0, saturationShift: 0, lightnessShift: 0 },
        },
      },
    ],
    color_Images: true,

    sizeOptions: [
      {
        sizeName: 'One Size',
        sizeSku: '-NA',
        ExtraCost: null,
        sizeDescription: null,
        dimensions: { width: null, height: null },
      },
    ],
    size_Images: false,
    sizeChart: null,
    sizeChartHtml: null,

    surfConf: {
      No_Mockup_Compatible: false,
      renderType: 'cylindrical',
      surfProp: {
        wrapAngle: 280,
        curveInten: 0.8,
        designRatio: { widthRatio: null, heightRatio: null },
      },
      blendSet: {
        defaultBlendMode: 'normal',
        defaultOpacity: 1,
        preserveColors: true,
      },
    },

    advanSurfMap: {
      curvProf: 'smooth',
      barrelDist: 0,
      pincushiDistor: 0,
      perspDis: 1,
      hasSeams: false,
    },

    seamPositions: [],

    lightingConfiguration: {
      lightDirection: 45,
      lightIntensity: 0.8,
      ambientLight: 0.3,
      shadowIntensity: 0.4,
    },

    // ⚠️  printT: mockupPhotos and custArea photos cleared (no media in Blanks CMS yet).
    // Upload the 4 webp images to Blanks CMS media, get their IDs, then:
    //   1. Update MEDIA_IDS at the top of this script
    //   2. Delete the created product from admin UI
    //   3. Re-run this script to recreate with images attached
    printT: [
      {
        technologyName: 'dtf',
        mockupPhotos: [],
        custAreas: [
          {
            areaId: 'area_o220ya2kg',
            areaName: 'Front',
            areaType: 'primary',
            'Minimum printing price': '110',
            'Per sq inch printing price': null,
            designCanvasPhotos: [],
            canvasDim: {
              widthInch: 2,
              heightInch: 4,
              canvasPixWid: 500,
              canvasPixHeight: 500,
              aspectRatioLocked: true,
            },
            restrictions: {
              minElementSize: { width: null, height: null },
              maxElements: null,
            },
          },
          {
            areaId: 'area_lq813p54x',
            areaName: 'Back',
            areaType: 'back',
            'Minimum printing price': '110',
            'Per sq inch printing price': null,
            designCanvasPhotos: [],
            canvasDim: {
              widthInch: 2,
              heightInch: 4,
              canvasPixWid: 500,
              canvasPixHeight: 500,
              aspectRatioLocked: true,
            },
            restrictions: {
              minElementSize: { width: null, height: null },
              maxElements: null,
            },
          },
        ],
        printingConstraints: {
          dpiRequirements: { minimum: 150, recommended: 300, maximum: 600 },
          sizeLimits: { minWidthInch: 1, minHeightInch: 1, maxWidthInch: 8.5, maxHeightInch: 3.6 },
          colorLimits: { maxColors: null, supportsFullColor: true },
          printBleeds: { bleedMargin: 3, safetyMargin: 5, trimTolerance: 1 },
        },
      },
    ],

        areaSynchRules: [],

    // ⚠️  No display images — add via admin UI after uploading to media
    displayImages: [],

    seo: {
      metaTitle: null,
      metaDescription: null,
    },

    prodInt: {
      prodTemp: 'auto_detect',
      autoDetSett: {
        enImgAnal: true,
        anAcc: 'balanced',
        detThres: 0.7,
        manlReq: true,
      },
      srtDef: {
        intfrmTlt: true,
        oMskRls: {
          enablesMask: true,
          edgeDetctMode: 'automatic',
          occlDetct: {
            detectCamHole: true,
            detectSeams: true,
            detectFolds: true,
            detectShadows: true,
          },
        },
      },
    },

    PrntTch: [],
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  // Dynamic imports after dotenv loads — same pattern as regenerate-media-sizes.ts
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config.js')

  const payload = await getPayload({ config })

  payload.logger.info('Starting seed: Tote Bag Non Zipper...')

  // ── Duplicate check by slug ──────────────────────────────────────────────
  const existing = await payload.find({
    collection: PRODUCTS_COLLECTION,
    where: { slug: { equals: 'tote-bag-non-zipper' } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length > 0) {
    payload.logger.info(
      `Product already exists with id: ${existing.docs[0].id} — skipping.`
    )
    payload.logger.info(
      'Delete the existing product first if you want to re-seed.'
    )
    process.exit(0)
  }

  // ── Create ───────────────────────────────────────────────────────────────
  const created = await payload.create({
    collection: PRODUCTS_COLLECTION,
    data: buildProductData() as any,
  })

  payload.logger.info(`✅  Created: "${created.name}" (id: ${created.id})`)
  payload.logger.info(`    Slug : ${created.slug}`)
  payload.logger.info(`    SKU  : ${created.sku}`)
  payload.logger.info('Done.')

  process.exit(0)
}

run().catch((err) => {
  if (err?.message?.includes("can't be found")) {
    console.error(`\n❌  Collection slug "${PRODUCTS_COLLECTION}" not found in Payload.`)
    console.error('    Find the real slug by running this in your terminal:')
    console.error('    Windows: findstr /n "slug" src\\collections\\BlankProducts.ts')
    console.error('    Mac/Linux: grep -n "slug" src/collections/BlankProducts.ts')
    console.error('    Then update PRODUCTS_COLLECTION at the top of this script.\n')
  } else {
    console.error('Script failed:', err)
  }
  process.exit(1)
})
