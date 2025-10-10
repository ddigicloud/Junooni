// collections/BlankProducts.ts - Fixed with unique database names & PostgreSQL compatibility
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import type { CollectionConfig, PayloadRequest } from 'payload';

export const BlankProducts: CollectionConfig = {
  slug: 'blank-products',
  //dbName: 'blank_products',
  access: {
    read: () => true,
  },
  admin: { 
    useAsTitle: 'name',
    description: 'Professional print-on-demand with advanced masking & surface mapping',
    defaultColumns: ['name', 'sku', 'brand', 'productType', 'status', 'updatedAt'],
    group: 'Products',
  },
 
  fields: [
    // =====================================
    // BASIC PRODUCT INFORMATION
    // =====================================
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            { 
              name: 'name', 
              type: 'text', 
              required: true,
              admin: {
                description: 'Product name as displayed to customers',
              },
            },
            {
              name: 'slug',
              type: 'text',
              unique: true,
              admin: {
                description: 'URL-friendly version of the name',
              },
              hooks: {
                beforeValidate: [
                  ({ data, originalDoc }) => {
                    if (data.slug) {
                      return data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    }
                    if (originalDoc?.slug) {
                      return originalDoc.slug;
                    }
                    return data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  },
                ],
              },
            },
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'draft',
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Draft', value: 'draft' },
                { label: 'Discontinued', value: 'discontinued' },
                { label: 'Out of Stock', value: 'out_of_stock' },
                { label: 'Coming Soon', value: 'coming_soon' },
              ],
            },
            {
              name: 'productType',
              type: 'select',
              label: 'Product Type',
              required: true,
              defaultValue: 'apparel_tshirt',
              options: [
                { label: 'Apparel - T-Shirt', value: 'apparel_tshirt' },
                { label: 'Apparel - Hoodie', value: 'apparel_hoodie' },
                { label: 'Apparel - Sweatshirt', value: 'apparel_sweatshirt' },
                { label: 'Apparel - Tank Top', value: 'apparel_tank' },
                { label: 'Apparel - Long Sleeve', value: 'apparel_longsleeve' },
                { label: 'Apparel - Hat/Cap', value: 'apparel_hat' },
                { label: 'Apparel - Beanie', value: 'apparel_beanie' },
                { label: 'Drinkware - Coffee Mug', value: 'drinkware_mug' },
                { label: 'Drinkware - Water Bottle', value: 'drinkware_bottle' },
                { label: 'Drinkware - Tumbler', value: 'drinkware_tumbler' },
                { label: 'Print - Poster', value: 'print_poster' },
                { label: 'Print - Canvas', value: 'print_canvas' },
                { label: 'Print - Business Card', value: 'print_business_card' },
                { label: 'Print - Sticker', value: 'print_sticker' },
                { label: 'Accessories - Phone Case', value: 'accessories_phone_case' },
                { label: 'Accessories - Tote Bag', value: 'accessories_tote_bag' },
                { label: 'Accessories - Backpack', value: 'accessories_backpack' },
                { label: 'Home - Pillow', value: 'home_pillow' },
                { label: 'Home - Blanket', value: 'home_blanket' },
                { label: 'Home - Towel', value: 'home_towel' },
                { label: 'Other', value: 'other' },
              ],
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
            },
            {
              name: 'tags',
              type: 'array',
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        
        // =====================================
        // VENDOR & SOURCING TAB
        // =====================================
        {
          label: 'Vendor & Sourcing',
          fields: [
            { 
              name: 'brand', 
              type: 'text', 
              required: true,
            },
            { 
              name: 'brandSku',
              type: 'text',
              //dbName: 'brand_sku',
            },
            { 
              name: 'sku', 
              type: 'text', 
              required: true,
              unique: true,
            },
            {
              name: 'vendorInfo',
              type: 'group',
              //dbName: 'vendor_info',
              label: 'Additional Vendor Information',
              fields: [
                {
                  name: 'supplier',
                  type: 'select',
                  options: [
                    { label: 'Printful', value: 'printful' },
                    { label: 'Printify', value: 'printify' },
                    { label: 'Gooten', value: 'gooten' },
                    { label: 'Qikink', value: 'qikink' },
                    { label: 'Local Supplier', value: 'local' },
                    { label: 'Direct Manufacturer', value: 'direct' },
                    { label: 'Other', value: 'other' },
                  ],
                },
                {
                  name: 'supplierProductId',
                  type: 'text',
                  //dbName: 'supplier_prod_id',
                },
                {
                  name: 'countryOrigin',
                  type: 'text',
                  //dbName: 'country_origin',
                },
              ],
            },
            {
              name: 'sourcing',
              type: 'group',
              //dbName: 'sourcing_info',
              fields: [
                {
                  name: 'minOrderQty',
                  type: 'number',
                  //dbName: 'min_order_qty',
                  min: 1,
                },
                {
                  name: 'leadTimeDays',
                  type: 'text',
                  //dbName: 'lead_time_days',
                },
                {
                  name: 'shipTimeDays',
                  type: 'text',
                  //dbName: 'lead_time_days',
                },
                {
                  name: 'rushAvailable',
                  type: 'checkbox',
                  //dbName: 'rush_available',
                },
                {
                  name: 'rushLeadTimeDays',
                  type: 'number',
                  //dbName: 'rush_lead_days',
                  admin: {
                    condition: (data) => data?.sourcing?.rushAvailable,
                  },
                },
              ],
            },
          ],
        },

        // =====================================
        // PRICING & COSTS TAB
        // =====================================
        {
          label: 'Pricing & Costs',
          fields: [
            { 
              name: 'cost', 
              type: 'number', 
              required: true, 
              min: 0,
            },
             { 
              name: 'GST Cost', 
              type: 'number', 
              min: 0,
            },
            {
              name: 'pricing',
              type: 'group',
              //dbName: 'pricing_info',
              fields: [
                {
                  name: 'markupType',
                  type: 'select',
                  //dbName: 'markup_type',
                  options: [
                    { label: 'Percentage', value: 'percentage' },
                    { label: 'Fixed Amount', value: 'fixed' },
                    { label: 'Tiered', value: 'tiered' },
                  ],
                },
                {
                  name: 'markupValue',
                  type: 'number',
                  //dbName: 'markup_value',
                  admin: {
                    condition: (data) => data?.pricing?.markupType !== 'tiered',
                  },
                },
                {
                  name: 'suggestedRetail',
                  type: 'number',
                  //dbName: 'suggested_retail',
                },
              ],
            },
            {
              name: 'pricingTiers',
              type: 'array',
              //dbName: 'pricing_tiers',
              admin: {
                condition: (data) => data?.pricing?.markupType === 'tiered',
              },
              fields: [
                {
                  name: 'minQuantity',
                  type: 'number',
                  //dbName: 'min_quantity',
                  required: true,
                },
                {
                  name: 'maxQuantity',
                  type: 'number',
                  //dbName: 'max_quantity',
                },
                {
                  name: 'markupPercentage',
                  type: 'number',
                  //dbName: 'markup_percentage',
                  required: true,
                },
              ],
            },
            {
              name: 'additionalCosts',
              type: 'group',
              //dbName: 'additional_costs',
              fields: [
                {
                  name: 'printingCostPerArea',
                  type: 'number',
                  //dbName: 'printing_cost_area',
                },
                {
                  name: 'printingGST',
                  type: 'number',
                  //dbName: 'printing_cost_area',
                },
                {
                  name: 'setupFee',
                  type: 'number',
                  //dbName: 'setup_fee',
                },
                {
                  name: 'rushSurcharge',
                  type: 'number',
                  //dbName: 'rush_surcharge',
                },
              ],
            },
          ],
        },

        // =====================================
        // PRODUCT DETAILS TAB
        // =====================================
        {
          label: 'Product Details',
          fields: [
            {
              name: 'description', 
              type: 'textarea',
            },
            {
              name: 'features',
              type: 'richText',
              editor: lexicalEditor(),
            },
            {
              name: 'HSNCode',
              type: 'text',
              //dbName: 'mat_wght',
            },
            {
              name: 'materials',
              type: 'group',
              //dbName: 'material',
              fields: [
                {
                  name: 'primary',
                  type: 'text',
                  //dbName: 'prim_mat',
                },
                {
                  name: 'weight',
                  type: 'text',
                  //dbName: 'mat_wght',
                },
                {
                  name: 'construction',
                  type: 'text',
                },
                {
                  name: 'finish',
                  type: 'text',
                },
              
                // ENHANCED FABRIC PROPERTIES FOR ADVANCED RENDERING
                {
                  name: 'efabType',
                  type: 'select',
                  //dbName: 'efabty',
                  defaultValue: 'cotton',
                 
                  options: [
                    { label: 'Cotton', value: 'cotton' },
                    { label: 'Polyester', value: 'polyester' },
                    { label: 'Cotton Blend', value: 'blend' },
                    { label: 'Canvas', value: 'canvas' },
                    { label: 'Leather', value: 'leather' },
                    { label: 'Denim', value: 'denim' },
                    { label: 'Fleece', value: 'fleece' },
                    { label: 'Jersey', value: 'jersey' },
                    { label: 'Mesh', value: 'mesh' },
                    { label: 'Vinyl', value: 'vinyl' },
                    { label: 'Paper', value: 'paper' },
                    { label: 'Ceramic', value: 'ceramic' },
                    { label: 'Metal', value: 'metal' },
                    { label: 'Plastic', value: 'plastic' },
                  ],
                  admin: {
                    description: 'Material type for accurate surface rendering',
                  },
                },
                {
                  name: 'fabricWeight',
                  type: 'number',
                  //dbName: 'fabric_weight_gsm',
                  min: 50,
                  max: 1000,
                  defaultValue: 180,
                  admin: {
                    description: 'Fabric weight in GSM (grams per square meter)',
                  },
                },
                {
                  name: 'surfaceTexture',
                  type: 'select',
                  //dbName: 'surface_texture',
                  defaultValue: 'smooth',
                  options: [
                    { label: 'Smooth', value: 'smooth' },
                    { label: 'Textured', value: 'textured' },
                    { label: 'Rough', value: 'rough' },
                    { label: 'Glossy', value: 'glossy' },
                    { label: 'Matte', value: 'matte' },
                    { label: 'Satin', value: 'satin' },
                    { label: 'Brushed', value: 'brushed' },
                  ],
                },
                {
                  name: 'stretchability',
                  type: 'number',
                  //dbName: 'fabric_stretch',
                  min: 0,
                  max: 1,
                  defaultValue: 0.1,
                  admin: {
                    description: 'Fabric stretch factor (0 = no stretch, 1 = very stretchy)',
                    step: 0.1,
                  },
                },
                {
                  name: 'transparency',
                  type: 'number',
                  //dbName: 'fabric_transparency',
                  min: 0,
                  max: 1,
                  defaultValue: 0.05,
                  admin: {
                    description: 'Fabric transparency level (0 = opaque, 1 = transparent)',
                    step: 0.01,
                  },
                },
                {
                  name: 'reflectivity',
                  type: 'number',
                  //dbName: 'fabric_reflectivity',
                  min: 0,
                  max: 1,
                  defaultValue: 0.1,
                  admin: {
                    description: 'Surface reflectivity for lighting calculations',
                    step: 0.1,
                  },
                },
              ],
            },
            {
              name: 'careInstructions',
              type: 'array',
              //dbName: 'care_instructions',
              fields: [
                {
                  name: 'instruction',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'icon',
                  type: 'select',
                  defaultValue: 'wash_cold',
                  options: [
                    { label: 'Machine Wash Cold', value: 'wash_cold' },
                    { label: 'Machine Wash Warm', value: 'wash_warm' },
                    { label: 'Hand Wash', value: 'hand_wash' },
                    { label: 'Do Not Wash', value: 'no_wash' },
                    { label: 'Tumble Dry Low', value: 'dry_low' },
                    { label: 'Hang Dry', value: 'hang_dry' },
                    { label: 'Do Not Dry', value: 'no_dry' },
                    { label: 'Iron Low', value: 'iron_low' },
                    { label: 'Do Not Iron', value: 'no_iron' },
                    { label: 'Do Not Bleach', value: 'no_bleach' },
                  ],
                },
              ],
            },
          ],
        },

        // =====================================
        // DIMENSIONS & SPECS TAB
        // =====================================
        {
          label: 'Dimensions & Specs',
          fields: [
            {
              name: 'physicalDimensions',
              type: 'group',
              //dbName: 'physical_dimensions',
              label: 'Physical Product Dimensions',
              fields: [
                { 
                  name: 'widthInches', 
                  type: 'number',
                  //dbName: 'width_inches',
                },
                { 
                  name: 'heightInches', 
                  type: 'number',
                  //dbName: 'height_inches',
                },
                { 
                  name: 'depthInches', 
                  type: 'number',
                  //dbName: 'depth_inches',
                },
                {
                  name: 'diameter',
                  type: 'number',
                },
                {
                  name: 'units',
                  type: 'select',
                  defaultValue: 'inches',
                  options: [
                    { label: 'Inches', value: 'inches' },
                    { label: 'Centimeters', value: 'cm' },
                    { label: 'Millimeters', value: 'mm' },
                  ],
                },
              ],
            },
            {
              name: 'shippingInfo',
              type: 'group',
              //dbName: 'shipping_info',
              fields: [
                { 
                  name: 'weight', 
                  type: 'number', 
                  required: true,
                },
                { 
                  name: 'shippingDimensions', 
                  type: 'text',
                  //dbName: 'shipping_dimensions',
                },
                { 
                  name: 'shippingCharges', 
                  type: 'text',
                  //dbName: 'shipping_dimensions',
                },
                { 
                  name: 'shippingLocationID', 
                  type: 'text',
                  //dbName: 'shipping_location_id',
                },
                {
                  name: 'packageType',
                  type: 'select',
                  //dbName: 'package_type',
                  options: [
                    { label: 'Poly Mailer', value: 'poly_mailer' },
                    { label: 'Box', value: 'box' },
                    { label: 'Envelope', value: 'envelope' },
                    { label: 'Tube', value: 'tube' },
                    { label: 'Custom', value: 'custom' },
                  ],
                  defaultValue: 'poly_mailer',
                },
              ],
            },
          ],
        },

        // =====================================
        // VARIANTS TAB
        // =====================================
        {
          label: 'Variants',
          fields: [
            {
              name: 'colorOptions',
              type: 'array',
              //dbName: 'color_options',
              label: 'Color Options',
              minRows: 1,
              fields: [
                {
                  name: 'colorName',
                  type: 'text',
                  //dbName: 'color_name',
                  required: true,
                },
                {
                  name: 'colorHex',
                  type: 'text',
                  //dbName: 'color_hex',
                  required: true,
                },
                {
                  name: 'isPrimary',
                  type: 'checkbox',
                  //dbName: 'is_primary_color',
                },
                // 🆕 ENHANCED COLOR PROPERTIES FOR ACCURATE RENDERING
                {
                  name: 'fabricInteraction',
                  type: 'group',
                  //dbName: 'fabric_interaction',
                  label: 'Fabric Color Interaction',
                  fields: [
                    {
                      name: 'absorptionRate',
                      type: 'number',
                      //dbName: 'absorption_rate',
                      min: 0,
                      max: 1,
                      defaultValue: 0.1,
                      admin: {
                        description: 'How much ink the fabric color absorbs (affects final appearance)',
                        step: 0.01,
                      },
                    },
                    {
                      name: 'blendMode',
                      type: 'select',
                      //dbName: 'color_blend_mode',
                      defaultValue: 'multiply',
                      options: [
                        { label: 'Normal', value: 'normal' },
                        { label: 'Multiply', value: 'multiply' },
                        { label: 'Screen', value: 'screen' },
                        { label: 'Overlay', value: 'overlay' },
                        { label: 'Soft Light', value: 'soft_light' },
                      ],
                    },
                    {
                      name: 'colorShift',
                      type: 'group',
                      //dbName: 'color_shift_values',
                      fields: [
                        {
                          name: 'hueShift',
                          type: 'number',
                          //dbName: 'hue_shift',
                          min: -180,
                          max: 180,
                          defaultValue: 0,
                        },
                        {
                          name: 'saturationShift',
                          type: 'number',
                          //dbName: 'saturation_shift',
                          min: -100,
                          max: 100,
                          defaultValue: 0,
                        },
                        {
                          name: 'lightnessShift',
                          type: 'number',
                          //dbName: 'lightness_shift',
                          min: -100,
                          max: 100,
                          defaultValue: 0,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'color_Images',
              type: 'checkbox',
              //dbName: 'color_Images',
              defaultValue: true,
            },
            {
              name: 'sizeOptions',
              type: 'array',
              //dbName: 'size_options',
              label: 'Size Options',
              minRows: 1,
              fields: [
                {
                  name: 'sizeName',
                  type: 'text',
                  //dbName: 'size_name',
                  required: true,
                },
                {
                  name: 'sizeDescription',
                  type: 'textarea',
                  //dbName: 'size_description',
                },
                {
                  name: 'dimensions',
                  type: 'group',
                  //dbName: 'size_dimensions',
                  fields: [
                    { name: 'width', type: 'number' },
                    { name: 'height', type: 'number' },
                  ],
                },
              ],
            },
            {
              name: 'size_Images',
              type: 'checkbox',
              //dbName: 'size_Images',
              defaultValue: false,
            },
            {
              name: 'sizeChart',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'sizeChartHtml',
              type: 'textarea',
              
            },
          ],
        },

        // =====================================
        // 🆕 ADVANCED SURFACE CONFIGURATION TAB
        // =====================================
        {
          label: 'Surface & Rendering',
          description: 'Advanced surface mapping and rendering configuration',
          fields: [
            {
              name: 'surfConf',
              type: 'group',
              //dbName: 'surf_cfg',
              label: 'Surface Rendering Configuration',
              fields: [
                 {
                      name: 'No_Mockup_Compatible',
                      type: 'checkbox',
                      //dbName: 'not_mockup_compatible',
                      defaultValue: false,
                    },
                {
                  name: 'renderType',
                  type: 'select',
                  //dbName: 'render_type',
                  required: true,
                  defaultValue: 'flat',
                  options: [
                    { label: 'Flat Surface', value: 'flat' },
                    { label: 'Cylindrical Surface', value: 'cylindrical' },
                    { label: 'Conical Surface', value: 'conical' },
                    { label: 'Spherical Surface', value: 'spherical' },
                    { label: 'Complex 3D', value: 'complex_3d' },
                    { label: 'Apparel Body', value: 'apparel_body' },
                    { label: 'Sleeve Wrap', value: 'sleeve_wrap' },
                  ],
                },
                {
                  name: 'surfProp',
                  type: 'group',
                  //dbName: 'surf_props',
                  fields: [
                    {
                      name: 'wrapAngle',
                      type: 'number',
                      //dbName: 'wrap_angle',
                      defaultValue: 280,
                      min: 0,
                      max: 360,
                    },
                    {
                      name: 'curveInten',
                      type: 'number',
                      //dbName: 'curve_intensity',
                      min: 0,
                      max: 1,
                      defaultValue: 0.8,
                      admin: {
                        step: 0.1,
                      },
                    },
                    {
                      name: 'designRatio',
                      type: 'group',
                      //dbName: 'ratio',
                      fields: [
                        {
                          name: 'widthRatio',
                          type: 'number',
                          //dbName: 'width',
                          min: 0.1,
                          max: 2.0,
                        },
                        {
                          name: 'heightRatio',
                          type: 'number',
                          //dbName: 'height',
                          min: 0.1,
                          max: 2.0,
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'blendSet',
                  type: 'group',
                  //dbName: 'blend',
                  fields: [
                    {
                      name: 'defaultBlendMode',
                      type: 'select',
                      //dbName: 'mode',
                      defaultValue: 'normal',
                      options: [
                        { label: 'Normal', value: 'normal' },
                        { label: 'Multiply (Dark)', value: 'multiply' },
                        { label: 'Screen (Light)', value: 'screen' },
                        { label: 'Overlay', value: 'overlay' },
                        { label: 'Soft Light', value: 'soft_light' },
                      ],
                    },
                    {
                      name: 'defaultOpacity',
                      type: 'number',
                      //dbName: 'opacity',
                      min: 0.1,
                      max: 1.0,
                    },
                    {
                      name: 'preserveColors',
                      type: 'checkbox',
                      //dbName: 'preserve_colors',
                      defaultValue: true,
                    },
                   
                  ],
                },
              ],
            },
            // FLATTENED ADVANCED SURFACE MAPPING (separate group to avoid deep nesting)
            {
              name: 'advanSurfMap',
              type: 'group',
              //dbName: 'adv_surf_map',
              label: 'Advanced Surface Mapping',
              fields: [
                {
                  name: 'curvProf',
                  type: 'select',
                  //dbName: 'curve_profile',
                  defaultValue: 'smooth',
                  options: [
                    { label: 'Linear', value: 'linear' },
                    { label: 'Smooth', value: 'smooth' },
                    { label: 'Elastic', value: 'elastic' },
                    { label: 'Ease In', value: 'ease_in' },
                    { label: 'Ease Out', value: 'ease_out' },
                    { label: 'Custom Bezier', value: 'custom' },
                  ],
                },
                {
                  name: 'barrelDist',
                  type: 'number',
                  //dbName: 'barrel',
                  min: -1,
                  max: 1,
                  defaultValue: 0,
                  admin: {
                    description: 'Barrel distortion coefficient',
                    step: 0.01,
                  },
                },
                {
                  name: 'pincushiDistor',
                  type: 'number',
                  //dbName: 'pincushion',
                  min: -1,
                  max: 1,
                  defaultValue: 0,
                  admin: {
                    step: 0.01,
                  },
                },
                {
                  name: 'perspDis',
                  type: 'number',
                  //dbName: 'perspective',
                  min: 0,
                  max: 2,
                  defaultValue: 1,
                  admin: {
                    step: 0.1,
                  },
                },
                {
                  name: 'hasSeams',
                  type: 'checkbox',
                  //dbName: 'has_seams',
                  defaultValue: false,
                },
              ],
            },
            // FLATTENED SEAM CONFIGURATION
            {
              name: 'seamPositions',
              type: 'array',
              //dbName: 'seam_pos',
              label: 'Seam Positions',
              admin: {
                condition: (data) => data?.advancedSurfaceMapping?.hasSeams,
              },
              fields: [
                {
                  name: 'seamTypes',
                  type: 'select',
                  //dbName: 'seamtype',
                  options: [
                    { label: 'Side Seam', value: 'side' },
                    { label: 'Shoulder Seam', value: 'shoulder' },
                    { label: 'Sleeve Seam', value: 'sleeve' },
                    { label: 'Bottom Hem', value: 'hem' },
                    { label: 'Custom', value: 'custom' },
                  ],
                  defaultValue: 'side',
                },
                {
                  name: 'positionX',
                  type: 'number',
                  //dbName: 'x',
                  min: 0,
                  max: 1,
                  step: 0.01,
                },
                {
                  name: 'positionY',
                  type: 'number',
                  //dbName: 'y',
                  min: 0,
                  max: 1,
                  step: 0.01,
                },
                {
                  name: 'width',
                  type: 'number',
                  //dbName: 'width',
                  min: 0,
                  max: 0.1,
                  step: 0.001,
                },
                {
                  name: 'seamEffect',
                  type: 'select',
                  //dbName: 'effect',
                  defaultValue: 'indent',
                  options: [
                    { label: 'Indent', value: 'indent' },
                    { label: 'Raised', value: 'raised' },
                    { label: 'Flat', value: 'flat' },
                    { label: 'Shadow', value: 'shadow' },
                  ],
                },
              ],
            },
            // FLATTENED LIGHTING CONFIGURATION
            {
              name: 'lightingConfiguration',
              type: 'group',
              //dbName: 'lighting',
              label: 'Lighting Configuration',
              fields: [
                {
                  name: 'lightDirection',
                  type: 'number',
                  //dbName: 'direction',
                  min: 0,
                  max: 360,
                  defaultValue: 45,
                  admin: {
                    description: 'Light direction in degrees (0 = top, 90 = right)',
                  },
                },
                {
                  name: 'lightIntensity',
                  type: 'number',
                  //dbName: 'intensity',
                  min: 0,
                  max: 2,
                  defaultValue: 0.8,
                  admin: {
                    step: 0.1,
                  },
                },
                {
                  name: 'ambientLight',
                  type: 'number',
                  //dbName: 'ambient',
                  min: 0,
                  max: 1,
                  defaultValue: 0.3,
                  admin: {
                    step: 0.1,
                  },
                },
                {
                  name: 'shadowIntensity',
                  type: 'number',
                  //dbName: 'shadow',
                  min: 0,
                  max: 1,
                  defaultValue: 0.4,
                  admin: {
                    step: 0.1,
                  },
                },
              ],
            },
          ],
        },

        // =====================================
        // 🆕 ADVANCED PRINTING TECHNOLOGIES WITH MASKING
        // =====================================
        {
          label: 'Printing & Customization',
          fields: [
            {
              name: 'printT',
              type: 'array',
              //dbName: 'print_tech',
              label: 'Printing Technologies',
              fields: [
                {
                  name: 'id',
                  type: 'text',
                  admin: { hidden: true },
                  hooks: {
                    beforeValidate: [({ data }) => {
                      if (!data?.id) return `tech_${Math.random().toString(36).substring(2, 11)}`;
                      return data.id;
                    }],
                  },
                },
                {
                  name: 'technologyName',
                  type: 'select',
                  //dbName: 'technology_name',
                  defaultValue: 'dtg',
                  required: true,
                  options: [
                    { label: 'Direct-to-Garment (DTG)', value: 'dtg' },
                    { label: 'Direct-to-Film (DTF)', value: 'dtf' },
                    { label: 'Screen Printing', value: 'screen' },
                    { label: 'Sublimation', value: 'sublimation' },
                    { label: 'Embroidery', value: 'embroidery' },
                    { label: 'Vinyl/Heat Transfer', value: 'vinyl' },
                    { label: 'Digital Print', value: 'digital' },
                    { label: 'UV Printing', value: 'uv' },
                    { label: 'Laser Engraving', value: 'laser' },
                  ],
                },
                {
                  name: 'printingConstraints',
                  type: 'group',
                  //dbName: 'printing_constraints',
                  fields: [
                    {
                      name: 'dpiRequirements',
                      type: 'group',
                      //dbName: 'dpi_requirements',
                      fields: [
                        {
                          name: 'minimum',
                          type: 'number',
                          defaultValue: 150,
                        },
                        {
                          name: 'recommended',
                          type: 'number',
                          defaultValue: 300,
                        },
                        {
                          name: 'maximum',
                          type: 'number',
                          defaultValue: 600,
                        },
                      ],
                    },
                    {
                      name: 'sizeLimits',
                      type: 'group',
                      //dbName: 'size_limits',
                      fields: [
                        {
                          name: 'minWidthInch',
                          type: 'number',
                          //dbName: 'min_width_inch',
                          defaultValue: 1.0,
                        },
                        {

                          
                          name: 'minHeightInch',
                          type: 'number',
                          //dbName: 'min_height_inch',
                          defaultValue: 1.0,
                        },
                        {
                          name: 'maxWidthInch',
                          type: 'number',
                          //dbName: 'max_width_inch',
                        },
                        {
                          name: 'maxHeightInch',
                          type: 'number',
                          //dbName: 'max_height_inch',
                        },
                      ],
                    },
                    {
                      name: 'colorLimits',
                      type: 'group',
                      //dbName: 'color_limits',
                      fields: [
                        {
                          name: 'maxColors',
                          type: 'number',
                          //dbName: 'max_colors',
                        },
                        {
                          name: 'supportsFullColor',
                          type: 'checkbox',
                          //dbName: 'supports_full_color',
                          defaultValue: true,
                        },
                      ],
                    },
                    // 🆕 PRINT BLEED AND SAFETY MARGINS
                    {
                      name: 'printBleeds',
                      type: 'group',
                      //dbName: 'print_bleeds',
                      label: 'Print Bleeds & Safety Margins',
                      fields: [
                        {
                          name: 'bleedMargin',
                          type: 'number',
                          //dbName: 'bleed_margin',
                          min: 0,
                          max: 20,
                          defaultValue: 3,
                          admin: {
                            description: 'Bleed margin in millimeters',
                          },
                        },
                        {
                          name: 'safetyMargin',
                          type: 'number',
                          //dbName: 'safety_margin',
                          min: 0,
                          max: 50,
                          defaultValue: 5,
                          admin: {
                            description: 'Safety margin in millimeters',
                          },
                        },
                        {
                          name: 'trimTolerance',
                          type: 'number',
                          //dbName: 'trim_tolerance',
                          min: 0,
                          max: 5,
                          defaultValue: 1,
                          admin: {
                            description: 'Trim tolerance in millimeters',
                          },
                        },
                      ],
                    },
                  ],
                },

                // =====================================
                // 🆕 ADVANCED MOCKUP PHOTOS WITH MASKING
                // =====================================
                {
                  name: 'mockupPhotos',
                  type: 'array',
                  //dbName: 'tech_mockup_photos',
                  label: 'Technology Mockup Photos',
                  fields: [
                    { 
                      name: 'title', 
                      type: 'text', 
                      label: 'Mockup Title',
                    },
                    {
                      name: 'photo',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Mockup Photo',
                      required: true,
                    },
                    {
                          name: 'mocwidthpx',
                          type: 'number',
                          //dbName: 'canvas_wid_inc',
                          label:'Mockup Width (pixels)'
                          
                        },
                        {
                          name: 'mochigtpx',
                          type: 'number',
                          //dbName: 'canvas_ht_inch',
                          label: 'Mockup Height (pixels)',
                          
                        },
                        {
                          name: 'tmbwidthpx',
                          type: 'number',
                          //dbName: 'canvas_wid_inc',
                          label:'Mockup Thumbnail Width (pixels)'
                          
                        },
                        {
                          name: 'tmbhigtpx',
                          type: 'number',
                          //dbName: 'canvas_ht_inch',
                          label: 'Mockup Thumbnail Height (pixels)',
                          
                        },
                    {
                      name: 'viewAngle',
                      type: 'select',
                      label: 'View Angle',
                      defaultValue: 'front',
                      options: [
                        { label: 'Front', value: 'front' },
                        { label: 'Back', value: 'back' },
                        { label: 'Left Side', value: 'left' },
                        { label: 'Right Side', value: 'right' },
                        { label: '3/4 Front Left', value: 'three_quarter_front_left' },
                        { label: '3/4 Front Right', value: 'three_quarter_front_right' },
                        { label: 'Top Down', value: 'top' },
                        { label: 'Bottom Up', value: 'bottom' },
                        { label: 'Lifestyle', value: 'lifestyle' },
                        { label: 'Detail', value: 'detail' },
                        { label: 'Flat Lay', value: 'flat' },
                      ],
                    },
                    {
                      name: 'mockupType',
                      type: 'select',
                      //dbName: 'mockup_type',
                      defaultValue: 'studio',
                      options: [
                        { label: 'Studio Shot', value: 'studio' },
                        { label: 'Lifestyle', value: 'lifestyle' },
                        { label: 'Model', value: 'model' },
                        { label: 'Flat Lay', value: 'flat_lay' },
                      ]
                    },
                    {
                      name: 'photoColor',
                      type: 'text',
                      //dbName: 'photo_color',
                      label: 'Product Color (Hex)',
                      required: true,
                    },
                     {
                      name: 'photoSize',
                      type: 'text',
                      //dbName: 'photo_color',
                      label: 'Product Size'
                    },
                    {
      name: 'dispMaps',
      type: 'array',
      //dbName: 'dis_maps',
      label: 'Displacement Maps',
      admin: {
        description: 'Displacement maps for curved surfaces (mugs, bottles, curved products)',
             },
      fields: [
        {
          name: 'dispImg',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'PNG displacement map (512x512 recommended)',
          }
        },
        {
          name: 'dsrface',
          type: 'select',
          //dbName: 'dsrfaceTy',
          defaultValue: 'cylindrical',
          label: 'Surface Type',
          options: [
            { label: 'Cylindrical (Mugs, Bottles)', value: 'cylindrical' },
            { label: 'Conical (Tapered)', value: 'conical' },
            { label: 'Spherical (Balls)', value: 'spherical' },
          ]
        },
        {
          name: 'disint',
          type: 'number',
          min: 0,
          max: 2,
          defaultValue: 0.8,
          label: 'Displacement Intensity',
          admin: {
            description: 'Displacement intensity (0.1 = subtle, 1.5 = strong)',
          }
        },
        {
          name: 'disarea',
          type: 'text',
          required: true,
          label: 'Area Name',
          admin: {
            description: 'Which area this applies to (must match visibleArea areaName)',
          }
        }
      ]
    },

    // 2. ALPHA MASKS (for printable area clipping)
    {
      name: 'alpMasks',
      type: 'array',
      //dbName: 'alpha_masks',
      label: 'Alpha Masks',
      admin: {
        description: 'Alpha masks to define precise printable areas (white = printable, black = non-printable)',
      },
      fields: [
        {
          name: 'maskImg',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'PNG with alpha channel (same dimensions as mockup photo)',
          }
        },
        {
          name: 'alfarea',
          type: 'text',
          required: true,
          //dbName: 'alfarea',
          label: 'Area Name',
          admin: {
            description: 'Which area this mask applies to (must match visibleArea areaName)',
          }
        },
        {
          name: 'alfmask',
          type: 'select',
          label: 'Mask Type',
          //dbName: 'alfamask',
          defaultValue: 'alpha',
          options: [
            { label: 'Alpha Channel', value: 'alpha' },
            { label: 'Luminance (Brightness)', value: 'luminance' },
            { label: 'Red Channel', value: 'red_channel' },
          ]
        },
        {
          name: 'featherEdge',
          type: 'number',
          min: 0,
          max: 10,
          //dbName: 'fea_edge',
          label: 'Feather Edge',
          defaultValue: 1,
          admin: {
            description: 'Edge softness in pixels (0 = sharp, 5 = soft)',
          }
        }
      ]
    },

    // 3. LIGHTING OVERLAYS (for realism - shadows, highlights)
    {
      name: 'light',
      type: 'array',
      //dbName: 'light_over',
      label: 'Lighting Overlays',
      admin: {
        description: 'Lighting and shadow overlays for realistic mockup effects',
      },
      fields: [
        {
          name: 'overImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Overlay Image',
          required: true,
          admin: {
            description: 'PNG lighting/shadow overlay (same dimensions as mockup photo)',
          }
        },
        {
          name: 'ovrlyTyp',
          type: 'select',
          defaultValue: 'lighting',
          options: [
            { label: '💡 Lighting (Highlights)', value: 'lighting' },
            { label: '🌑 Shadow (Dark areas)', value: 'shadow' },
            { label: '✨ Reflection (Shiny)', value: 'reflection' },
            { label: '🌅 Ambient (Overall)', value: 'ambient' },
          ]
        },
        {
          name: 'overbldMde',
          type: 'select',
          //dbName: 'overbldMde',
          label: 'Blend Mode',
          defaultValue: 'overlay',
          options: [
            { label: 'Overlay (Recommended)', value: 'overlay' },
            { label: 'Multiply (Shadows)', value: 'multiply' },
            { label: 'Screen (Highlights)', value: 'screen' },
            { label: 'Soft Light (Subtle)', value: 'soft-light' },
            { label: 'Hard Light (Strong)', value: 'hard-light' },
          ]
        },
        {
          name: 'ovlayOpa',
          type: 'number',
          min: 0,
          max: 1,
          defaultValue: 0.6,
          label: 'Overlay Opacity',
          admin: {
            description: 'Overlay strength (0.1 = subtle, 0.8 = strong)',
          }
        },
        {
          name: 'overlayArea',
          type: 'text',
          label: 'Overlay Area Name',
          //dbName: 'overlay_area',
          admin: {
            description: 'Specific area (leave empty for entire mockup)',
          }
        }
      ]
    },

    // 4. RENDERING PREFERENCES (engine selection and quality)
    {
      name: 'render',
      type: 'group',
      //dbName: 'render_pref',
      label: 'Advanced Rendering',
      admin: {
        description: 'Control rendering engine and quality settings',
      },
      fields: [
        {
          name: 'pfEngine',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: '🤖 Auto (Recommended)', value: 'auto' },
            { label: '🎨 Canvas (Legacy)', value: 'canvas' },
            { label: '🚀 Pixi.js (Advanced)', value: 'pixi' },
          ],
          admin: {
            description: 'Auto selects best engine based on complexity',
          }
        },
        {
          name: 'enableAdvancedEffects',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable displacement, masking, and lighting effects',
          }
        },
        {
          name: 'quality',
          type: 'select',
          defaultValue: 'high',
          options: [
            { label: '⚡ Draft (Fast)', value: 'draft' },
            { label: '📱 Standard (Mobile)', value: 'standard' },
            { label: '🖥️ High (Desktop)', value: 'high' },
            { label: '🎯 Ultra (Print)', value: 'ultra' },
          ]
        },
        {
          name: 'exportRes',
          type: 'number',
          min: 1,
          max: 4,
          defaultValue: 2,
          admin: {
            description: 'Export resolution multiplier (1x to 4x for print)',
          }
        },
        {
          name: 'enableProgTrack',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show rendering progress to users',
          }
        }
      ]
    },
                    // 🆕 ENHANCED FABRIC PROPERTIES FOR MOCKUP
                    {
                      name: 'fbrcProp',
                      type: 'group',
                      //dbName: 'm_fabric_prop',
                      label: 'Fabric Properties for Rendering',
                      fields: [
                        {
                          name: 'mfab',
                          type: 'select',
                          //dbName: 'mfab_type',
                          defaultValue: 'cotton',
                          options: [
                            { label: 'Cotton', value: 'cotton' },
                            { label: 'Polyester', value: 'polyester' },
                            { label: 'Cotton Blend', value: 'cotton_blend' },
                            { label: 'Canvas', value: 'canvas' },
                            { label: 'Leather', value: 'leather' },
                            { label: 'Denim', value: 'denim' },
                            { label: 'Fleece', value: 'fleece' },
                            { label: 'Jersey', value: 'jersey' },
                          ],
                        },
                        {
                          name: 'fabricWeight',
                          type: 'number',
                          //dbName: 'mockup_fabric_weight',
                          min: 50,
                          max: 1000,
                          defaultValue: 180,
                        },
                        {
                          name: 'Texture',
                          type: 'select',
                          //dbName: 'mockup_surface_texture',
                          defaultValue: 'textured',
                          options: [
                            { label: 'Smooth', value: 'smooth' },
                            { label: 'Textured', value: 'textured' },
                            { label: 'Rough', value: 'rough' },
                            { label: 'Glossy', value: 'glossy' },
                            { label: 'Matte', value: 'matte' },
                          ],
                        },
                        {
                          name: 'stretchability',
                          type: 'number',
                          //dbName: 'mockup_stretchability',
                          min: 0,
                          max: 1,
                          defaultValue: 0.3,
                          admin: {
                            step: 0.1,
                          },
                        },
                        {
                          name: 'transparency',
                          type: 'number',
                          //dbName: 'mockup_transparency',
                          min: 0,
                          max: 1,
                          defaultValue: 0.05,
                          admin: {
                            step: 0.01,
                          },
                        },
                      ],
                    },
                    // 🆕 LIGHTING CONDITIONS FOR MOCKUP
                    {
                      name: 'lightingConditions',
                      type: 'group',
                      //dbName: 'mockup_lighting_conditions',
                      label: 'Lighting Conditions',
                      fields: [
                        {
                          name: 'lightDirection',
                          type: 'number',
                          //dbName: 'mockup_light_direction',
                          min: 0,
                          max: 360,
                          defaultValue: 45,
                        },
                        {
                          name: 'lightIntensity',
                          type: 'number',
                          //dbName: 'mockup_light_intensity',
                          min: 0,
                          max: 2,
                          defaultValue: 0.8,
                          admin: {
                            step: 0.1,
                          },
                        },
                        {
                          name: 'ambientLight',
                          type: 'number',
                          //dbName: 'mockup_ambient_light',
                          min: 0,
                          max: 1,
                          defaultValue: 0.3,
                          admin: {
                            step: 0.1,
                          },
                        },
                        {
                          name: 'shadowIntensity',
                          type: 'number',
                          //dbName: 'mockup_shadow_intensity',
                          min: 0,
                          max: 1,
                          defaultValue: 0.4,
                          admin: {
                            step: 0.1,
                          },
                        },
                      ],
                    },
                    // 🆕 ADVANCED VISIBLE AREAS WITH MASKING
                    {
                      name: 'area',
                      type: 'array',
                      //dbName: 'mockup_visible_areas',
                      label: 'Visible Areas with Advanced Masking',
                      minRows: 0,
                      fields: [
                        {
                          name: 'areaName',
                          type: 'text',
                          //dbName: 'visible_area_name',
                          required: true,
                        },
                        {
                          name: 'visibility',
                          type: 'select',
                          defaultValue: 'full',
                          options: [
                            { label: 'Fully Visible', value: 'full' },
                            { label: 'Partially Visible', value: 'partial' },
                            { label: 'Edge/Wrap Visible', value: 'edge' },
                            { label: 'Sleeve Visible', value: 'sleeve' },
                            { label: 'Shadow Zone', value: 'shadow' },
                            { label: 'Reflection Zone', value: 'reflection' },
                          ],
                        },
                        {
                          name: 'visibilityPercentage',
                          type: 'number',
                          //dbName: 'visibility_percentage',
                          min: 0,
                          max: 100,
                          defaultValue: 100,
                          admin: {
                            description: 'Percentage of area visible (0-100%)',
                            condition: (data, siblingData) => siblingData?.visibility === 'partial',
                          },
                        },
                        // 🆕 ADVANCED MASKING CONFIGURATION (FLATTENED)
                        {
                          name: 'Config',
                          type: 'group',
                          //dbName: 'masking',
                          label: 'Advanced Masking Configuration',
                          fields: [
                            {
                              name: 'enableMasking',
                              type: 'checkbox',
                              //dbName: 'enable',
                              defaultValue: false,
                            },
                            {
                              name: 'mask',
                              type: 'select',
                              //dbName: 'masktype',
                              defaultValue: 'gradient',
                              options: [
                                { label: 'Gradient Mask', value: 'gradient' },
                                { label: 'Sharp Edge', value: 'sharp' },
                                { label: 'Soft Edge', value: 'soft' },
                                { label: 'Custom SVG', value: 'svg' },
                                { label: 'Fabric Fold', value: 'fold' },
                                { label: 'Seam Line', value: 'seam' },
                              ],
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableMasking,
                              },
                            },
                            {
                              name: 'maskPath',
                              type: 'textarea',
                              //dbName: 'path',
                              admin: {
                                description: 'SVG path data for custom masking',
                                condition: (data, siblingData) => siblingData?.maskTypes === 'svg',
                              },
                            },
                          ],
                        },
                        // GRADIENT MASK SETTINGS (FLATTENED)
                        {
                          name: 'grdnmsk',
                          type: 'group',
                          //dbName: 'gradient',
                          label: 'Gradient Mask Settings',
                          admin: {
                            condition: (data, siblingData) => siblingData?.maskingConfiguration?.maskTypes === 'gradient',
                          },
                          fields: [
                            {
                              name: 'grdn',
                              type: 'select',
                              //dbName: 'direction',
                               label: 'Gradient direction',
                              defaultValue: 'horizontal',
                              options: [
                                { label: 'Horizontal', value: 'horizontal' },
                                { label: 'Vertical', value: 'vertical' },
                                { label: 'Radial', value: 'radial' },
                                { label: 'Custom Angle', value: 'angle' },
                              ],
                            },
                            {
                              name: 'gradientAngle',
                              type: 'number',
                              //dbName: 'angle',
                              min: 0,
                              max: 360,
                              defaultValue: 0,
                              admin: {
                                condition: (data, siblingData) => siblingData?.gradientDirection === 'angle',
                              },
                            },
                            {
                              name: 'fadeStart',
                              type: 'number',
                              //dbName: 'start',
                              min: 0,
                              max: 1,
                              defaultValue: 0.7,
                              admin: {
                                description: 'Where fade starts (0-1)',
                                step: 0.01,
                              },
                            },
                            {
                              name: 'fadeEnd',
                              type: 'number',
                              //dbName: 'end',
                              min: 0,
                              max: 1,
                              defaultValue: 1.0,
                              admin: {
                                description: 'Where fade ends (0-1)',
                                step: 0.01,
                              },
                            },
                            {
                              name: 'fadeIntensity',
                              type: 'number',
                              //dbName: 'intensity',
                              min: 0,
                              max: 1,
                              defaultValue: 0.8,
                              admin: {
                                step: 0.1,
                              },
                            },
                          ],
                        },
                        // EDGE DETECTION SETTINGS (FLATTENED)
                        {
                          name: 'edgeDetectionSettings',
                          type: 'group',
                          //dbName: 'edge_detect',
                          label: 'Edge Detection Parameters',
                          fields: [
                            {
                              name: 'enableEdgeDetection',
                              type: 'checkbox',
                              //dbName: 'enable',
                              defaultValue: false,
                            },
                            {
                              name: 'edgeThreshold',
                              type: 'number',
                              //dbName: 'threshold',
                              min: 0,
                              max: 255,
                              defaultValue: 128,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableEdgeDetection,
                              },
                            },
                            {
                              name: 'edgeSoftness',
                              type: 'number',
                              //dbName: 'softness',
                              min: 0,
                              max: 20,
                              defaultValue: 2,
                              admin: {
                                description: 'Edge softness in pixels',
                                condition: (data, siblingData) => siblingData?.enableEdgeDetection,
                              },
                            },
                          ],
                        },
                        // 🆕 FABRIC INTEGRATION FOR AREA (FLATTENED)
                        {
                          name: 'fbrc',
                          type: 'group',
                          //dbName: 'fabric_integ',
                          label: 'Fabric Integration',
                          fields: [
                            {
                              name: 'enableFabricBlend',
                              type: 'checkbox',
                              //dbName: 'enable',
                              defaultValue: true,
                            },
                            {
                              name: 'bfab',
                              type: 'select',
                              //dbName: 'ftype',
                              defaultValue: 'cotton',
                              label: 'Fabric Type',
                              options: [
                                { label: 'Cotton', value: 'cotton' },
                                { label: 'Polyester', value: 'polyester' },
                                { label: 'Canvas', value: 'canvas' },
                                { label: 'Leather', value: 'leather' },
                                { label: 'Denim', value: 'denim' },
                              ],
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableFabricBlend,
                              },
                            },
                            {
                              name: 'foldAwareness',
                              type: 'checkbox',
                              //dbName: 'fold_aware',
                              defaultValue: true,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableFabricBlend,
                              },
                            },
                            {
                              name: 'seamAwareness',
                              type: 'checkbox',
                              //dbName: 'seam_aware',
                              defaultValue: true,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableFabricBlend,
                              },
                            },
                            {
                              name: 'textureIntensity',
                              type: 'number',
                              //dbName: 'texture',
                              min: 0,
                              max: 1,
                              defaultValue: 0.3,
                              admin: {
                                step: 0.1,
                                condition: (data, siblingData) => siblingData?.enableFabricBlend,
                              },
                            },
                            {
                              name: 'fabricColor',
                              type: 'text',
                              //dbName: 'color',
                              defaultValue: '#ffffff',
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableFabricBlend,
                              },
                            },
                            {
                              name: 'fabricRoughness',
                              type: 'number',
                              //dbName: 'roughness',
                              min: 0,
                              max: 1,
                              defaultValue: 0.3,
                              admin: {
                                step: 0.1,
                                condition: (data, siblingData) => siblingData?.enableFabricBlend,
                              },
                            },
                          ],
                        },
                        // DESIGN PLACEMENT CONFIGURATION (FLATTENED)
                        {
                          name: 'design',
                          type: 'group',
                          //dbName: 'placement',
                          label: 'Design Placement Configuration',
                          fields: [
                            // Base Coordinates
                            {
                              name: 'coordinateX',
                              type: 'number',
                              //dbName: 'x',
                              min: 0,
                              max: 1,
                              required: true,
                              admin: {
                                description: 'X position (0.0-1.0)',
                              },
                            },
                            {
                              name: 'coordinateY',
                              type: 'number',
                              //dbName: 'y',
                              min: 0,
                              max: 1,
                              required: true,
                              admin: {
                                description: 'Y position (0.0-1.0)',
                              },
                            },
                            {
                              name: 'coordinateWidth',
                              type: 'number',
                              //dbName: 'width',
                              min: 0,
                              max: 1,
                              required: true,
                              admin: {
                                description: 'Width (0.0-1.0)',
                              },
                            },
                            {
                              name: 'coordinateHeight',
                              type: 'number',
                              //dbName: 'height',
                              min: 0,
                              max: 1,
                              required: true,
                              admin: {
                                description: 'Height (0.0-1.0)',
                              },
                            },
                            // Transform Values
                            {
                              name: 'rotation',
                              type: 'number',
                              //dbName: 'rotation',
                              defaultValue: 0,
                            },
                            {
                              name: 'skewX',
                              type: 'number',
                              //dbName: 'skew_x',
                              defaultValue: 0,
                            },
                            {
                              name: 'skewY',
                              type: 'number',
                              //dbName: 'skew_y',
                              defaultValue: 0,
                            },
                            {
                              name: 'scaleX',
                              type: 'number',
                              //dbName: 'scale_x',
                              defaultValue: 1,
                            },
                            {
                              name: 'scaleY',
                              type: 'number',
                              //dbName: 'scale_y',
                              defaultValue: 1,
                            },
                            // Render Settings
                            {
                              name: 'blend',
                              type: 'select',
                              //dbName: 'blend_mode',
                              defaultValue: 'normal',
                              options: [
                                { label: 'Normal', value: 'normal' },
                                { label: 'Multiply', value: 'multiply' },
                                { label: 'Screen', value: 'screen' },
                                { label: 'Overlay', value: 'overlay' },
                                { label: 'Soft Light', value: 'soft_light' },
                              ],
                            },
                            {
                              name: 'opacity',
                              type: 'number',
                              //dbName: 'opacity',
                              min: 0.1,
                              max: 1,
                            },
                            {
                              name: 'preserveColors',
                              type: 'checkbox',
                              //dbName: 'preserve_colors',
                            },
                          ],
                        },
                          {
                            name: 'uvMap',
                              type: 'group',
                              fields: [
                                {
                            name: 'srfc',
                            type: 'select',
                            options: ['planar', 'cylinder', 'frustum', 'sphere', 'mesh'],
                            label: 'Surface Type',
                          },
                          { name: 'uStart', type: 'number', defaultValue: 0 },
                          { name: 'vStart', type: 'number', defaultValue: 0 },
                          { name: 'uSpan', type: 'number', defaultValue: 1 },
                          { name: 'vSpan', type: 'number', defaultValue: 1 },
                          { name: 'uRepeat', type: 'number' },
                          { name: 'vRepeat', type: 'number' },
                          { name: 'rotationDeg', type: 'number' },
                          {
                            name: 'orn',
                            type: 'group',
                            label: 'Orientation Reference',
                            fields: [
                              {
                                name: 'type',
                                type: 'select',
                                options: ['feature', 'angle', 'pixel']
                              
                              },
                              { name: 'featureName', type: 'text' },
                              { name: 'angleDeg', type: 'number' },
                              { name: 'pixelX', type: 'number' }
                            ]
                          },
                          {
                            name: 'wrpmdU',
                            type: 'select',
                            options: ['clamp', 'repeat', 'mirror']
                          },
                          {
                            name: 'wpmdV',
                            type: 'select',
                            options: ['clamp', 'repeat', 'mirror']
                          }
                        ]
                      },
                        // SURFACE WRAP SETTINGS (FLATTENED)
                        {
                          name: 'surfaceWrapSettings',
                          type: 'group',
                          //dbName: 'wrap_sets',
                          label: 'Surface Wrap Settings',
                          fields: [
                            {
                              name: 'enableWrap',
                              type: 'checkbox',
                              //dbName: 'enable',
                            },
                            {
                              name: 'wrapAngle',
                              type: 'number',
                              //dbName: 'angle',
                              min: 0,
                              max: 360,
                              defaultValue: 280,
                            },
                            {
                              name: 'wrapIntensity',
                              type: 'number',
                              //dbName: 'intensity',
                              min: 0,
                              max: 1,
                              defaultValue: 0.8,
                            },
                            {
                              name: 'dynamicWrap',
                              type: 'checkbox',
                              //dbName: 'dynamic',
                              defaultValue: false,
                            },
                            {
                              name: 'wrapFalloff',
                              type: 'number',
                              //dbName: 'falloff',
                              min: 0,
                              max: 1,
                              defaultValue: 0.8,
                              admin: {
                                step: 0.1,
                              },
                            },
                          ],
                        },
                        // PERSPECTIVE CORRECTION (FLATTENED)
                        {
                          name: 'perspectiveSettings',
                          type: 'group',
                          //dbName: 'perspective',
                          label: 'Perspective Correction',
                          fields: [
                            {
                              name: 'enablePerspective',
                              type: 'checkbox',
                              //dbName: 'enable',
                              defaultValue: false,
                            },
                            {
                              name: 'perspectiveIntensity',
                              type: 'number',
                              //dbName: 'intensity',
                              min: 0,
                              max: 1,
                              defaultValue: 0.5,
                            },
                            {
                              name: 'dynamicPerspective',
                              type: 'checkbox',
                              //dbName: 'dynamic',
                              defaultValue: false,
                            },
                          ],
                        },
                        // FABRIC EFFECTS (FLATTENED)
                        {
                          name: 'fbrEft',
                          type: 'group',
                          //dbName: 'fabric_fx',
                          label: 'Advanced Fabric Effects',
                          fields: [
                            {
                              name: 'enableFolds',
                              type: 'checkbox',
                              //dbName: 'enable_folds',
                              defaultValue: false,
                            },
                            {
                              name: 'foldIntensity',
                              type: 'number',
                              //dbName: 'fold_intensity',
                              min: 0,
                              max: 1,
                              defaultValue: 0.3,
                              admin: {
                                step: 0.1,
                                condition: (data, siblingData) => siblingData?.enableFolds,
                              },
                            },
                            {
                              name: 'fold',
                              type: 'select',
                              //dbName: 'fold_direction',
                              defaultValue: 'horizontal',
                              options: [
                                { label: 'Horizontal', value: 'horizontal' },
                                { label: 'Vertical', value: 'vertical' },
                                { label: 'Radial', value: 'radial' },
                                { label: 'Random', value: 'random' },
                              ],
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableFolds,
                              },
                            },
                            {
                              name: 'seamDistrt',
                              type: 'checkbox',
                              //dbName: 'seam_distrt',
                              label: 'Seam Distortion',
                              defaultValue: false,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableFolds,
                              },
                            },
                            {
                              name: 'fabricDpth',
                              type: 'number',
                              //dbName: 'depth',
                              label: 'Fabric Depth',
                              min: 0,
                              max: 10,
                              defaultValue: 1,
                              admin: {
                                description: 'Fabric depth effect in pixels',
                                condition: (data, siblingData) => siblingData?.enableFolds,
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'priority',
                      type: 'number',
                      defaultValue: 0,
                    },
                    {
                      name: 'tags',
                      type: 'array',
                      //dbName: 'mockup_tags',
                      fields: [
                        {
                          name: 'tag',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },

                // =====================================
                // CUSTOMIZATION AREAS (EXISTING WITH ENHANCEMENTS)
                // =====================================
                {
                  name: 'custAreas',
                  type: 'array',
                  //dbName: 'cust_areas',
                  label: 'Customization Areas',
                  fields: [
                    {
                      name: 'areaId',
                      type: 'text',
                      admin: { hidden: true },
                      hooks: {
                        beforeValidate: [({ data }) => {
                          if (!data?.areaId) return `area_${Math.random().toString(36).substring(2, 11)}`;
                          return data.areaId;
                        }],
                      },
                    },
                    {
                      name: 'areaName',
                      type: 'text',
                      //dbName: 'cust_area_name',
                      label: 'Area Name',
                      required: true,
                    },
                    {
                      name: 'areaType',
                      type: 'select',
                      //dbName: 'cust_ar_type',
                      label: 'Area Type',
                      options: [
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                        { label: 'Accent', value: 'accent' },
                        { label: 'Sleeve', value: 'sleeve' },
                        { label: 'Back', value: 'back' },
                        { label: 'Pocket', value: 'pocket' },
                      ],
                      defaultValue: 'primary',
                    },
                    {
                      name: 'Minimum printing price',
                      type: 'text',
                    },
                    {
                      name: 'Per sq inch printing price',
                      type: 'text',
                    },
                    {
                      name: 'canvasDim',
                      type: 'group',
                      //dbName: 'canvas_dim',
                      label: 'Canvas Dimensions',
                      fields: [
                        {
                          name: 'widthInch',
                          type: 'number',
                          //dbName: 'canvas_wid_inc',
                          label:'Width (inches)',
                          required: true,
                        },
                        {
                          name: 'heightInch',
                          type: 'number',
                          //dbName: 'canvas_ht_inch',
                          label: 'Height (inches)',
                          required: true,
                        },
                        {
                          name: 'canvasPixWid',
                          type: 'number',
                          //dbName: 'canvas_pix_wid',
                          label: 'Canvas Width (pixels)',
                          defaultValue: 800,
                        },
                        {
                          name: 'canvasPixHeight',
                          type: 'number',
                          //dbName: 'canvas_pix_ht',
                          defaultValue: 600,
                        },
                        {
                          name: 'aspectRatioLocked',
                          type: 'checkbox',
                          //dbName: 'asp_rat_locked',
                          defaultValue: true,
                        },
                      ],
                    },
                    {
                      name: 'designCanvasPhotos',
                      type: 'array',
                      //dbName: 'design_canvas_photos',
                      fields: [
                        {
                          name: 'photo',
                          type: 'upload',
                          relationTo: 'media',
                          required: true,
                        },
                        {
                          name: 'photoColor',
                          type: 'text',
                          //dbName: 'canvas_photo_color',
                        },
                        {
                          name: 'printAreaCoord',
                          type: 'group',
                          //dbName: 'print_area_coord',
                          label: 'Printable Area Coordinates',
                          fields: [
                            { name: 'x', type: 'number', min: 0, max: 1 },
                            { name: 'y', type: 'number', min: 0, max: 1 },
                            { name: 'width', type: 'number', min: 0, max: 1 },
                            { name: 'height', type: 'number', min: 0, max: 1 },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'restrictions',
                      type: 'group',
                      //dbName: 'area_rest',
                      fields: [
                        {
                          name: 'minElementSize',
                          type: 'group',
                          //dbName: 'min_element_size',
                          fields: [
                            { name: 'width', type: 'number' },
                            { name: 'height', type: 'number' },
                          ],
                        },
                        {
                          name: 'maxElements',
                          type: 'number',
                          //dbName: 'max_elements',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'areaSynchRules',
              type: 'array',
              //dbName: 'area_sync_rules',
              label: 'Design Synchronization Rules',
              fields: [
                {
                  name: 'ruleName',
                  type: 'text',
                  //dbName: 'sync_rule_name',
                  required: true,
                },
                {
                  name: 'sourceArea',
                  type: 'text',
                  //dbName: 'sync_source_area',
                  required: true,
                },
                {
                  name: 'targetAreas',
                  type: 'array',
                  //dbName: 'sync_target_areas',
                  fields: [
                    {
                      name: 'area',
                      type: 'text',
                    },
                  ],
                },
                {
                  name: 'syncType',
                  type: 'select',
                  //dbName: 'sync_type',
                  options: [
                    { label: 'Copy', value: 'copy' },
                    { label: 'Mirror Horizontal', value: 'mirror_h' },
                    { label: 'Mirror Vertical', value: 'mirror_v' },
                    { label: 'Scale', value: 'scale' },
                  ],
                },
              ],
            },
          ],
        },

        // =====================================
        // MEDIA & DISPLAY TAB
        // =====================================
        {
          label: 'Media & Display',
          fields: [
            {
              name: 'displayImages',
              type: 'array',
              //dbName: 'display_images',
              label: 'Product Gallery',
              minRows: 1,
              maxRows: 10,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'title',
                  type: 'text',
                },
                {
                  name: 'caption',
                  type: 'text',
                },
              ],
            },
            {
              name: 'seo',
              type: 'group',
              //dbName: 'seo_info',
              fields: [
                {
                  name: 'metaTitle',
                  type: 'text',
                  //dbName: 'meta_title',
                },
                {
                  name: 'metaDescription',
                  type: 'textarea',
                  //dbName: 'meta_description',
                },
              ],
            },
          ],
        },

        // =====================================
        // 🆕 SMART PRODUCT INTELLIGENCE TAB
        // =====================================
        {
          label: 'Smart Intelligence',
          description: 'AI-powered product detection and smart defaults',
          fields: [
            {
              name: 'prodInt',
              type: 'group',
              //dbName: 'prod_int',
              label: 'Product Intelligence Configuration',
              fields: [
                {
                  name: 'prodTemp',
                  type: 'select',
                  //dbName: 'prod_temp',
                  required: true,
                  defaultValue: 'auto_detect',
                  options: [
                    { label: '🤖 Auto-Detect from Images', value: 'auto_detect' },
                    { label: '👕 Apparel - T-Shirt Standard', value: 'apparel_tshirt_standard' },
                    { label: '👕 Apparel - T-Shirt Folded', value: 'apparel_tshirt_folded' },
                    { label: '🧥 Apparel - Hoodie Front', value: 'apparel_hoodie_front' },
                    { label: '🧥 Apparel - Hoodie Lifestyle', value: 'apparel_hoodie_lifestyle' },
                    { label: '📱 Phone Case - iPhone 15 Pro', value: 'phone_iphone15pro' },
                    { label: '📱 Phone Case - iPhone 14', value: 'phone_iphone14' },
                    { label: '📱 Phone Case - Samsung S24', value: 'phone_samsung_s24' },
                    { label: '📱 Phone Case - Google Pixel', value: 'phone_pixel' },
                    { label: '☕ Drinkware - Standard Mug', value: 'mug_standard' },
                    { label: '☕ Drinkware - Travel Tumbler', value: 'tumbler_travel' },
                    { label: '🏠 Home - Pillow Square', value: 'pillow_square' },
                    { label: '🏠 Home - Canvas Print', value: 'canvas_standard' },
                    { label: '💼 Accessories - Tote Bag', value: 'bag_tote' },
                    { label: '🎯 Custom Configuration', value: 'custom' },
                  ],
                  admin: {
                    description: 'Choose smart template or let AI auto-detect from your mockup images',
                  },
                },
                {
                  name: 'autoDetSett',
                  type: 'group',
                  //dbName: 'au_det_sett',
                  label: 'Auto-Detection Settings',
                  admin: {
                    condition: (data) => data?.productIntelligence?.productTemplate === 'auto_detect',
                  },
                  fields: [
                    {
                      name: 'enImgAnal',
                      type: 'checkbox',
                      //dbName: 'enaimg_anal',
                      label: 'Enable Image Analysis',
                      defaultValue: true,
                      admin: {
                        description: 'Automatically analyze uploaded mockup images to detect customizable areas',
                      },
                    },
                    {
                      name: 'anAcc',
                      type: 'select',
                      //dbName: 'anal_acc',
                      defaultValue: 'balanced',
                      options: [
                        { label: '⚡ Fast (Good for simple products)', value: 'fast' },
                        { label: '⚖️ Balanced (Recommended)', value: 'balanced' },
                        { label: '🎯 High Precision (Complex products)', value: 'precise' },
                        { label: '🔬 Ultra Precise (AI-Enhanced)', value: 'ultra' },
                      ],
                    },
                    {
                      name: 'detThres',
                      type: 'number',
                      //dbName: 'detthrs',
                      label: 'Detection Confidence Threshold',
                      min: 0.1,
                      max: 1.0,
                      defaultValue: 0.7,
                      admin: {
                        description: 'Minimum confidence level for auto-detected areas (0.1 = low, 1.0 = very high)',
                        step: 0.1,
                      },
                    },
                    {
                      name: 'manlReq',
                      type: 'checkbox',
                      //dbName: 'manual_rev_req',
                      label: 'Manual Review Required',
                      defaultValue: true,
                      admin: {
                        description: 'Require manual review of auto-detected areas before activation',
                      },
                    },
                  ],
                },
                {
                  name: 'srtDef',
                  type: 'group',
                  //dbName: 'smtdef',
                  label: 'Smart Defaults & Templates',
                  fields: [
                    {
                      name: 'intfrmTlt',
                      type: 'checkbox',
                      //dbName: 'inht_fm_temp',
                      label: 'Inherit From Template',
                      defaultValue: true,
                      admin: {
                        description: 'Use smart defaults from selected product template',
                      },
                    },
                    {
                      name: 'oMskRls',
                      type: 'group',
                      //dbName: 'atmskrule',
                      label: 'Auto-Masking Intelligence',
                      fields: [
                        {
                          name: 'enablesMask',
                          type: 'checkbox',
                          //dbName: 'enble_smrt_msk',
                          label: 'Enable Smart Masking',
                          defaultValue: true,
                          admin: {
                            description: 'Automatically create masks for edge transitions, sleeves, and occlusions',
                          },
                        },
                        {
                          name: 'edgeDetctMode',
                          type: 'select',
                          //dbName: 'edge_detect_mode',
                          defaultValue: 'automatic',
                          options: [
                            { label: '🤖 Automatic (AI-powered)', value: 'automatic' },
                            { label: '📐 Geometric (Rule-based)', value: 'geometric' },
                            { label: '🎨 Color-based', value: 'color' },
                            { label: '🔍 Contrast-based', value: 'contrast' },
                            { label: '🧠 Machine Learning', value: 'ml' },
                          ],
                          admin: {
                            condition: (data) => data?.smartDefaults?.autoMaskingRules?.enableSmartMasking,
                          },
                        },
                        {
                          name: 'occlDetct',
                          type: 'group',
                          //dbName: 'occ_detect',
                          label: 'Occlusion Detection',
                          admin: {
                            condition: (data) => data?.smartDefaults?.autoMaskingRules?.enableSmartMasking,
                          },
                          fields: [
                            {
                              name: 'detectCamHole',
                              type: 'checkbox',
                              //dbName: 'detect_cam_holes',
                              defaultValue: true,
                              admin: {
                                description: 'Automatically detect and mask camera holes in phone cases',
                              },
                            },
                            {
                              name: 'detectSeams',
                              type: 'checkbox',
                              //dbName: 'detect_seams',
                              defaultValue: true,
                              admin: {
                                description: 'Automatically detect seam lines in apparel',
                              },
                            },
                            {
                              name: 'detectFolds',
                              type: 'checkbox',
                              //dbName: 'detect_folds',
                              defaultValue: true,
                              admin: {
                                description: 'Automatically detect fabric folds and wrinkles',
                              },
                            },
                            {
                              name: 'detectShadows',
                              type: 'checkbox',
                              //dbName: 'detect_shadows',
                              defaultValue: true,
                              admin: {
                                description: 'Automatically detect shadow areas for realistic rendering',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // =====================================
        // 🆕 ENHANCED PRINTING TECHNOLOGIES WITH SMART TEMPLATES
        // =====================================
        {
          label: 'Smart Printing & Mockups',
          fields: [
            {
              name: 'PrntTch',
              type: 'array',
              //dbName: 'smart_print_tech',
              label: 'Printing Technologies with Smart Mockups',
              fields: [
                {
                  name: 'id',
                  type: 'text',
                  admin: { hidden: true },
                  hooks: {
                    beforeValidate: [({ data }) => {
                      if (!data?.id) return `smart_tech_${Math.random().toString(36).substring(2, 11)}`;
                      return data.id;
                    }],
                  },
                },
                {
                  name: 'technologyName',
                  type: 'select',
                  //dbName: 'smart_technology_name',
                  defaultValue: 'dtg',
                  required: true,
                  options: [
                    { label: 'Direct-to-Garment (DTG)', value: 'dtg' },
                    { label: 'Direct-to-Film (DTF)', value: 'dtf' },
                    { label: 'Screen Printing', value: 'screen' },
                    { label: 'Sublimation', value: 'sublimation' },
                    { label: 'Embroidery', value: 'embroidery' },
                    { label: 'Vinyl/Heat Transfer', value: 'vinyl' },
                    { label: 'Digital Print', value: 'digital' },
                    { label: 'UV Printing', value: 'uv' },
                    { label: 'Laser Engraving', value: 'laser' },
                  ],
                },
                
                // =====================================
                // 🆕 SMART MOCKUP PHOTOS WITH AUTO-DETECTION
                // =====================================
                {
                  name: 'smtMckpPht',
                  type: 'array',
                  //dbName: 'smart_mockup_photos',
                  label: 'Smart Mockup Photos',
                  admin: {
                    description: 'Upload mockup photos and let AI detect customizable areas automatically',
                  },
                  fields: [
                    { 
                      name: 'title', 
                      type: 'text', 
                      label: 'Mockup Title',
                      admin: {
                        description: 'e.g., "Front View", "Folded Style", "Lifestyle Shot"',
                      },
                    },
                    {
                      name: 'photo',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Mockup Photo',
                      required: true,
                      admin: {
                        description: 'Upload high-quality mockup image (AI will analyze automatically)',
                      },
                    },
                    {
                      name: 'view',
                      type: 'select',
                      label: 'View Angle',
                      defaultValue: 'front',
                      options: [
                        { label: 'Front View', value: 'front' },
                        { label: 'Back View', value: 'back' },
                        { label: 'Left Side', value: 'left' },
                        { label: 'Right Side', value: 'right' },
                        { label: '3/4 Front Left', value: 'three_quarter_front_left' },
                        { label: '3/4 Front Right', value: 'three_quarter_front_right' },
                        { label: 'Folded/Flat Lay', value: 'folded' },
                        { label: 'Lifestyle/Model', value: 'lifestyle' },
                        { label: 'Detail Shot', value: 'detail' },
                        { label: 'Top Down', value: 'top' },
                      ],
                    },
                    {
                      name: 'mock',
                      type: 'select',
                      //dbName: 'smart_mockup_style',
                      defaultValue: 'studio',
                      options: [
                        { label: '📸 Studio Shot (Clean background)', value: 'studio' },
                        { label: '🏠 Lifestyle (In environment)', value: 'lifestyle' },
                        { label: '👤 Model Wearing', value: 'model' },
                        { label: '📐 Flat Lay', value: 'flat_lay' },
                        { label: '📦 Folded Product', value: 'folded' },
                        { label: '🎯 Detail/Close-up', value: 'detail' },
                      ],
                    },
                    {
                      name: 'photoColor',
                      type: 'text',
                      //dbName: 'smart_photo_color',
                      label: 'Product Color (Hex)',
                      required: true,
                      admin: {
                        description: 'Base color of the product in this mockup',
                      },
                    },

                    // =====================================
                    // 🆕 AI ANALYSIS RESULTS (AUTO-POPULATED)
                    // =====================================
                    {
                      name: 'Anl',
                      type: 'group',
                      //dbName: 'ai_anal_results',
                      label: 'AI Analysis Results',
                      admin: {
                        description: 'Automatically populated by AI image analysis',
                        readOnly: true,
                      },
                      fields: [
                        {
                          name: 'Sts',
                          type: 'select',
                          //dbName: 'ai_analysis_status',
                          defaultValue: 'pending',
                          label: 'Analysis Status',
                          options: [
                            { label: '⏳ Pending Analysis', value: 'pending' },
                            { label: '🔄 Processing', value: 'processing' },
                            { label: '✅ Completed', value: 'completed' },
                            { label: '❌ Failed', value: 'failed' },
                            { label: '⚠️ Needs Review', value: 'needs_review' },
                          ],
                          admin: {
                            readOnly: true,
                          },
                        },
                        {
                          name: 'detProdTy',
                          type: 'text',
                          //dbName: 'ai_det_prod_type',
                          admin: {
                            description: 'AI-detected product type',
                            readOnly: true,
                          },
                        },
                        {
                          name: 'confScore',
                          type: 'number',
                          //dbName: 'ai_confidence_score',
                          min: 0,
                          max: 1,
                          admin: {
                            description: 'AI confidence level (0-1)',
                            readOnly: true,
                            step: 0.01,
                          },
                        },
                        {
                          name: 'detAr',
                          type: 'array',
                          //dbName: 'ai_detected_areas',
                          admin: {
                            description: 'AI-detected customizable areas',
                            readOnly: true,
                          },
                          fields: [
                            {
                              name: 'arNme',
                              type: 'text',
                              //dbName: 'ai_area_name',
                              admin: { readOnly: true },
                            },
                            {
                              name: 'bodBx',
                              type: 'group',
                              //dbName: 'ai_bou_box',
                              label: 'Bounding Box',
                              fields: [
                                { name: 'x', type: 'number', min: 0, max: 1, admin: { readOnly: true } },
                                { name: 'y', type: 'number', min: 0, max: 1, admin: { readOnly: true } },
                                { name: 'width', type: 'number', min: 0, max: 1, admin: { readOnly: true } },
                                { name: 'height', type: 'number', min: 0, max: 1, admin: { readOnly: true } },
                              ],
                            },
                            {
                              name: 'confdnce',
                              type: 'number',
                              //dbName: 'ai_area_confidence',
                              min: 0,
                              max: 1,
                              admin: { readOnly: true },
                            },
                            {
                              name: 'suggesMask',
                              type: 'textarea',
                              //dbName: 'ai_sugg_mask',
                              admin: {
                                description: 'AI-suggested masking path (SVG)',
                                readOnly: true,
                              },
                            },
                          ],
                        },
                        {
                          name: 'dtc',
                          type: 'array',
                          //dbName: 'ai_det_obs',
                          admin: {
                            description: 'AI-detected obstructions (camera holes, seams, etc.)',
                            readOnly: true,
                          },
                          fields: [
                            {
                              name: 'obs',
                              type: 'select',
                              //dbName: 'ai_obs_type',
                              options: [
                                { label: '📷 Camera Hole', value: 'camera_hole' },
                                { label: '🔊 Speaker Hole', value: 'speaker_hole' },
                                { label: '🧵 Seam Line', value: 'seam' },
                                { label: '📱 Port Opening', value: 'port' },
                                { label: '🔘 Button Area', value: 'button' },
                                { label: '🌊 Fabric Fold', value: 'fold' },
                                { label: '🌑 Shadow Area', value: 'shadow' },
                                { label: '❓ Unknown', value: 'unknown' },
                              ],
                              admin: { readOnly: true },
                            },
                            {
                              name: 'boundbox',
                              type: 'group',
                              //dbName: 'ai_obstruction_bbox',
                              label: 'Bounding Box',
                              fields: [
                                { name: 'x', type: 'number', min: 0, max: 1, admin: { readOnly: true } },
                                { name: 'y', type: 'number', min: 0, max: 1, admin: { readOnly: true } },
                                { name: 'width', type: 'number', min: 0, max: 1, admin: { readOnly: true } },
                                { name: 'height', type: 'number', min: 0, max: 1, admin: { readOnly: true } },
                              ],
                            },
                            {
                              name: 'confidence',
                              type: 'number',
                              //dbName: 'ai_obs_conf',
                              min: 0,
                              max: 1,
                              admin: { readOnly: true },
                            },
                          ],
                        },
                      ],
                    },

                    // =====================================
                    // 🆕 SMART VISIBLE AREAS (AI + MANUAL)
                    // =====================================
                    {
                      name: 'Vsa',
                      type: 'array',
                      //dbName: 'smart_visible_areas',
                      label: 'Smart Visible Areas',
                      admin: {
                        description: 'AI-detected areas with smart defaults + manual overrides',
                      },
                      fields: [
                        {
                          name: 'areaName',
                          type: 'text',
                          //dbName: 'sm_ar_name',
                          required: true,
                          admin: {
                            description: 'Area name (auto-populated from AI or manual entry)',
                          },
                        },
                        {
                          name: 'Src',
                          type: 'select',
                          //dbName: 'smart_data_source',
                          defaultValue: 'ai_detected',
                          options: [
                            { label: '🤖 AI Detected', value: 'ai_detected' },
                            { label: '📋 Template Default', value: 'template' },
                            { label: '✏️ Manual Entry', value: 'manual' },
                            { label: '🔄 AI + Manual Override', value: 'hybrid' },
                          ],
                          admin: {
                            description: 'How this area configuration was created',
                          },
                        },
                        {
                          name: 'apStt',
                          type: 'select',
                          //dbName: 'smrt_app_stats',
                          defaultValue: 'pending_review',
                          options: [
                            { label: '⏳ Pending Review', value: 'pending_review' },
                            { label: '✅ Approved', value: 'approved' },
                            { label: '❌ Rejected', value: 'rejected' },
                            { label: '✏️ Needs Adjustment', value: 'needs_adjustment' },
                          ],
                          admin: {
                            description: 'Manual review status for AI-detected areas',
                          },
                        },
                        {
                          name: 'vsblty',
                          type: 'select',
                          //dbName: 'smart_visibility',
                          defaultValue: 'full',
                          options: [
                            { label: '✅ Fully Visible', value: 'full' },
                            { label: '🔸 Partially Visible', value: 'partial' },
                            { label: '📐 Edge/Wrap Visible', value: 'edge' },
                            { label: '👕 Sleeve Visible', value: 'sleeve' },
                            { label: '🌑 Shadow Zone', value: 'shadow' },
                            { label: '🪞 Reflection Zone', value: 'reflection' },
                            { label: '📱 Device Cutout', value: 'device_cutout' },
                          ],
                        },
                        {
                          name: 'visibilityPercentage',
                          type: 'number',
                          //dbName: 'smart_visibility_percentage',
                          min: 0,
                          max: 100,
                          defaultValue: 100,
                          admin: {
                            description: 'Percentage of area visible (AI can auto-calculate)',
                            condition: (data, siblingData) => 
                              siblingData?.visibility === 'partial' || 
                              siblingData?.visibility === 'edge' ||
                              siblingData?.visibility === 'sleeve',
                          },
                        },
                        
                        // =====================================
                        // 🆕 SMART MASKING (AI-POWERED) - FLATTENED
                        // =====================================
                        {
                          name: 'smrt',
                          type: 'group',
                          //dbName: 'smart_mask',
                          label: 'Smart Masking Configuration',
                          fields: [
                            {
                              name: 'enableSmartMask',
                              type: 'checkbox',
                              //dbName: 'enable',
                              defaultValue: true,
                              admin: {
                                description: 'Use AI-powered smart masking for this area',
                              },
                            },
                            {
                              name: 'Srtgy',
                              type: 'select',
                              //dbName: 'strategy',
                              defaultValue: 'ai_automatic',
                              options: [
                                { label: '🤖 AI Automatic', value: 'ai_automatic' },
                                { label: '📐 Template-based', value: 'template' },
                                { label: '🎨 Custom Manual', value: 'manual' },
                                { label: '🔄 AI + Manual Hybrid', value: 'hybrid' },
                              ],
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableSmartMask,
                              },
                            },
                          ],
                        },
                        // AI MASK SETTINGS (FLATTENED)
                        {
                          name: 'Msk',
                          type: 'group',
                          //dbName: 'ai_mask_sets',
                          label: 'AI Mask Settings',
                          admin: {
                            condition: (data, siblingData) => 
                              siblingData?.smartMasking?.enableSmartMask && 
                              (siblingData?.smartMasking?.maskingStrategy === 'ai_automatic' || siblingData?.smartMasking?.maskingStrategy === 'hybrid'),
                          },
                          fields: [
                            {
                              name: 'edg',
                              type: 'select',
                              //dbName: 'edgelevel',
                              defaultValue: 'medium',
                              options: [
                                { label: '🔸 Soft (Gentle transitions)', value: 'soft' },
                                { label: '⚖️ Medium (Balanced)', value: 'medium' },
                                { label: '🔲 Sharp (Crisp edges)', value: 'sharp' },
                                { label: '🎯 Ultra-precise', value: 'ultra' },
                              ],
                            },
                            {
                              name: 'adaptToLighting',
                              type: 'checkbox',
                              //dbName: 'adapt_lighting',
                              defaultValue: true,
                              admin: {
                                description: 'Automatically adapt masking based on lighting conditions',
                              },
                            },
                            {
                              name: 'fabricAwareness',
                              type: 'checkbox',
                              //dbName: 'fabric_aware',
                              defaultValue: true,
                              admin: {
                                description: 'Consider fabric properties when creating masks',
                              },
                            },
                            {
                              name: 'seamDetection',
                              type: 'checkbox',
                              //dbName: 'seam_detect',
                              defaultValue: true,
                              admin: {
                                description: 'Automatically detect and handle seam lines',
                              },
                            },
                          ],
                        },
                        // AI GENERATED MASK (FLATTENED)
                        {
                          name: 'gnMsk',
                          type: 'group',
                          //dbName: 'gen_mask',
                          label: 'AI-Generated Mask (Auto-populated)',
                          admin: {
                            description: 'Automatically generated by AI analysis',
                            readOnly: true,
                          },
                          fields: [
                            {
                              name: 'maskPath',
                              type: 'textarea',
                              //dbName: 'path',
                              admin: {
                                description: 'SVG path for the generated mask',
                                readOnly: true,
                              },
                            },
                            {
                              name: 'mskTyp',
                              type: 'select',
                              //dbName: 'aimask_type',
                              options: [
                                { label: 'Gradient Mask', value: 'gradient' },
                                { label: 'Vector Path', value: 'vector' },
                                { label: 'Bitmap Mask', value: 'bitmap' },
                                { label: 'Composite Mask', value: 'composite' },
                              ],
                              admin: { readOnly: true },
                            },
                            {
                              name: 'maskConfidence',
                              type: 'number',
                              //dbName: 'confidence',
                              min: 0,
                              max: 1,
                              admin: {
                                description: 'AI confidence in generated mask quality',
                                readOnly: true,
                              },
                            },
                          ],
                        },

                        // =====================================
                        // ENHANCED DESIGN PLACEMENT (FLATTENED)
                        // =====================================
                        {
                          name: 'smartPlacement',
                          type: 'group',
                          //dbName: 'smart_place',
                          label: 'Smart Design Placement',
                          fields: [
                            // Auto-Calculated Coordinates (Read-only)
                            {
                              name: 'autoX',
                              type: 'number',
                              //dbName: 'auto_x',
                              min: 0,
                              max: 1,
                              admin: {
                                description: 'X position (AI-calculated)',
                                readOnly: true,
                              },
                            },
                            {
                              name: 'autoY',
                              type: 'number',
                              //dbName: 'auto_y',
                              min: 0,
                              max: 1,
                              admin: {
                                description: 'Y position (AI-calculated)',
                                readOnly: true,
                              },
                            },
                            {
                              name: 'autoWidth',
                              type: 'number',
                              //dbName: 'auto_width',
                              min: 0,
                              max: 1,
                              admin: {
                                description: 'Width (AI-calculated)',
                                readOnly: true,
                              },
                            },
                            {
                              name: 'autoHeight',
                              type: 'number',
                              //dbName: 'auto_height',
                              min: 0,
                              max: 1,
                              admin: {
                                description: 'Height (AI-calculated)',
                                readOnly: true,
                              },
                            },
                            // Manual Override Settings
                            {
                              name: 'enableManualOverride',
                              type: 'checkbox',
                              //dbName: 'enable_override',
                              defaultValue: false,
                              admin: {
                                description: 'Override AI-calculated placement with manual values',
                              },
                            },
                            {
                              name: 'manualX',
                              type: 'number',
                              //dbName: 'manual_x',
                              min: 0,
                              max: 1,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableManualOverride,
                              },
                            },
                            {
                              name: 'manualY',
                              type: 'number',
                              //dbName: 'manual_y',
                              min: 0,
                              max: 1,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableManualOverride,
                              },
                            },
                            {
                              name: 'manualWidth',
                              type: 'number',
                              //dbName: 'manual_width',
                              min: 0,
                              max: 1,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableManualOverride,
                              },
                            },
                            {
                              name: 'manualHeight',
                              type: 'number',
                              //dbName: 'manual_height',
                              min: 0,
                              max: 1,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableManualOverride,
                              },
                            },
                            // Transform Settings
                            {
                              name: 'rotation',
                              type: 'number',
                              //dbName: 'rotation',
                              defaultValue: 0,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableManualOverride,
                              },
                            },
                            {
                              name: 'skewX',
                              type: 'number',
                              //dbName: 'skew_x',
                              defaultValue: 0,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableManualOverride,
                              },
                            },
                            {
                              name: 'skewY',
                              type: 'number',
                              //dbName: 'skew_y',
                              defaultValue: 0,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableManualOverride,
                              },
                            },
                            {
                              name: 'scaleX',
                              type: 'number',
                              //dbName: 'scale_x',
                              defaultValue: 1,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableManualOverride,
                              },
                            },
                            {
                              name: 'scaleY',
                              type: 'number',
                              //dbName: 'scale_y',
                              defaultValue: 1,
                              admin: {
                                condition: (data, siblingData) => siblingData?.enableManualOverride,
                              },
                            },
                          ],
                        },
                      ],
                    },

                    {
                      name: 'priority',
                      type: 'number',
                      defaultValue: 0,
                      admin: {
                        description: 'Display priority (higher numbers appear first)',
                      },
                    },
                    {
                      name: 'tags',
                      type: 'array',
                      //dbName: 'smart_mockup_tags',
                      fields: [
                        {
                          name: 'tag',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },

                // =====================================
                // SIMPLIFIED CUSTOMIZATION AREAS
                // =====================================
                {
                  name: 'smtCstmtnAr',
                  type: 'array',
                  //dbName: 'smart_customization_areas',
                  label: 'Smart Customization Areas',
                  admin: {
                    description: 'AI-enhanced customization areas with smart defaults',
                  },
                  fields: [
                    {
                      name: 'areaId',
                      type: 'text',
                      admin: { hidden: true },
                      hooks: {
                        beforeValidate: [({ data }) => {
                          if (!data?.areaId) return `smart_area_${Math.random().toString(36).substring(2, 11)}`;
                          return data.areaId;
                        }],
                      },
                    },
                    {
                      name: 'areaName',
                      type: 'text',
                      //dbName: 'smart_customization_area_name',
                      required: true,
                      admin: {
                        description: 'e.g., "Front", "Back", "Left Sleeve", "Camera Area"',
                      },
                    },
                    {
                      name: 'areaType',
                      type: 'select',
                      //dbName: 'smart_customization_area_type',
                      options: [
                        { label: '🎯 Primary Design Area', value: 'primary' },
                        { label: '📋 Secondary Area', value: 'secondary' },
                        { label: '✨ Accent Area', value: 'accent' },
                        { label: '👕 Sleeve Area', value: 'sleeve' },
                        { label: '🔙 Back Area', value: 'back' },
                        { label: '👔 Pocket Area', value: 'pocket' },
                        { label: '📱 Device-Specific', value: 'device_specific' },
                      ],
                      defaultValue: 'primary',
                    },
                    {
                      name: 'smartCanvasConfig',
                      type: 'group',
                      //dbName: 'smart_canvas',
                      label: 'Smart Canvas Configuration',
                      fields: [
                        {
                          name: 'useAICalculatedDimensions',
                          type: 'checkbox',
                          //dbName: 'use_ai_dims',
                          defaultValue: true,
                          admin: {
                            description: 'Use AI-calculated optimal dimensions for this area',
                          },
                        },
                        // AI Calculated Dimensions (Flattened)
                        {
                          name: 'aiWidthInches',
                          type: 'number',
                          //dbName: 'ai_width',
                          admin: { 
                            readOnly: true,
                            condition: (data, siblingData) => siblingData?.useAICalculatedDimensions,
                          },
                        },
                        {
                          name: 'aiHeightInches',
                          type: 'number',
                          //dbName: 'ai_height',
                          admin: { 
                            readOnly: true,
                            condition: (data, siblingData) => siblingData?.useAICalculatedDimensions,
                          },
                        },
                        {
                          name: 'aiCanvasPixelWidth',
                          type: 'number',
                          //dbName: 'ai_pixel_w',
                          admin: { 
                            readOnly: true,
                            condition: (data, siblingData) => siblingData?.useAICalculatedDimensions,
                          },
                        },
                        {
                          name: 'aiCanvasPixelHeight',
                          type: 'number',
                          //dbName: 'ai_pixel_h',
                          admin: { 
                            readOnly: true,
                            condition: (data, siblingData) => siblingData?.useAICalculatedDimensions,
                          },
                        },
                        // Manual Dimensions (Flattened)
                        {
                          name: 'manualWidthInches',
                          type: 'number',
                          //dbName: 'manual_width',
                          required: true,
                          admin: {
                            condition: (data, siblingData) => !siblingData?.useAICalculatedDimensions,
                          },
                        },
                        {
                          name: 'manualHeightInches',
                          type: 'number',
                          //dbName: 'manual_height',
                          required: true,
                          admin: {
                            condition: (data, siblingData) => !siblingData?.useAICalculatedDimensions,
                          },
                        },
                        {
                          name: 'manualCanvasPixelWidth',
                          type: 'number',
                          //dbName: 'manual_pixel_w',
                          defaultValue: 800,
                          admin: {
                            condition: (data, siblingData) => !siblingData?.useAICalculatedDimensions,
                          },
                        },
                        {
                          name: 'manualCanvasPixelHeight',
                          type: 'number',
                          //dbName: 'manual_pixel_h',
                          defaultValue: 600,
                          admin: {
                            condition: (data, siblingData) => !siblingData?.useAICalculatedDimensions,
                          },
                        },
                        {
                          name: 'aspectRatioLocked',
                          type: 'checkbox',
                          //dbName: 'aspect_locked',
                          defaultValue: true,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        
      ],
    },
  ],

  // =====================================
  // ENHANCED HOOKS WITH AI PROCESSING
  // =====================================
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation }) => {
        // Existing hooks...
        
        // 🆕 TRIGGER AI ANALYSIS FOR NEW MOCKUP PHOTOS
        if (data?.smartPrintingTechnologies) {
          for (let techIndex = 0; techIndex < data.smartPrintingTechnologies.length; techIndex++) {
            const tech = data.smartPrintingTechnologies[techIndex];
            if (tech?.smartMockupPhotos) {
              for (let mockupIndex = 0; mockupIndex < tech.smartMockupPhotos.length; mockupIndex++) {
                const mockup = tech.smartMockupPhotos[mockupIndex];
                
                // Check if this is a new mockup or photo has changed
                const isNewMockup = !originalDoc?.smartPrintingTechnologies?.[techIndex]?.smartMockupPhotos?.[mockupIndex];
                const photoChanged = mockup.photo !== originalDoc?.smartPrintingTechnologies?.[techIndex]?.smartMockupPhotos?.[mockupIndex]?.photo;
                
                if ((isNewMockup || photoChanged) && mockup.photo) {
                  // Mark for AI analysis
                  if (!mockup.aiAnalysisResults) {
                    mockup.aiAnalysisResults = {};
                  }
                  mockup.aiAnalysisResults.analysisStatus = 'pending';
                  
                  // TODO: Queue AI analysis job
                  console.log(`🤖 Queuing AI analysis for mockup: ${mockup.title}`);
                  
                  // In a real implementation, you would:
                  // 1. Queue background job for image analysis
                  // 2. Use computer vision API (Google Vision, AWS Rekognition, etc.)
                  // 3. Apply machine learning models for product detection
                  // 4. Generate smart defaults based on product template
                }
              }
            }
          }
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        if (operation === 'create' || operation === 'update') {
          console.log(`✅ Smart product ${doc.name} ${operation}d with AI-powered configuration`);
          
          // Count AI-powered features
          if (doc.smartPrintingTechnologies) {
            const aiMockupCount = doc.smartPrintingTechnologies.reduce((count: number, tech: any) => {
              return count + (tech.smartMockupPhotos?.length || 0);
            }, 0);
            
            const pendingAnalysis = doc.smartPrintingTechnologies.reduce((count: number, tech: any) => {
              return count + (tech.smartMockupPhotos?.filter((mockup: any) => 
                mockup.aiAnalysisResults?.analysisStatus === 'pending'
              ).length || 0);
            }, 0);
            
            if (aiMockupCount > 0) {
              console.log(`🤖 Product has ${aiMockupCount} smart mockups, ${pendingAnalysis} pending AI analysis`);
            }
          }
        }
      },
    ],
  },
};