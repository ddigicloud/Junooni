 // collections/BlankProducts.ts
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import type { CollectionConfig, PayloadRequest } from 'payload';

export const BlankProducts: CollectionConfig = {
  slug: 'blank-products',
  dbName: 'blank_products', // 14 chars
  access: {
    read: () => true,
    
  },
  admin: { 
    useAsTitle: 'name',
    description: 'Professional print-on-demand product catalog with industry-grade customization',
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
              admin: {
                description: 'Product availability status',
              },
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
              admin: {
                description: 'Product categories for organization and filtering',
              },
            },
            {
              name: 'tags',
              type: 'array',
              dbName: 'tags',
              admin: {
                description: 'Tags for enhanced searchability',
              },
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
              admin: {
                description: 'Brand or manufacturer name',
              },
            },
            { 
              name: 'brandSku',
              type: 'text',
              dbName: 'brand_sku', // 9 chars
              admin: {
                description: 'Vendor\'s SKU or product code',
              },
            },
            { 
              name: 'sku', 
              type: 'text', 
              required: true,
              unique: true,
              admin: {
                description: 'Your internal SKU',
              },
            },
            {
              name: 'vendorInfo',
              type: 'group',
              dbName: 'vendor', // 6 chars
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
                  dbName: 'supp_prod_id', // 12 chars
                  admin: {
                    description: 'Product ID in supplier\'s system',
                  },
                },
                {
                  name: 'countryOfOrigin',
                  type: 'text',
                  dbName: 'origin', // 6 chars
                  admin: {
                    description: 'Manufacturing country',
                  },
                },
              ],
            },
            {
              name: 'sourcing',
              type: 'group',
              fields: [
                {
                  name: 'minimumOrderQuantity',
                  type: 'number',
                  dbName: 'moq', // 3 chars
                 
                  min: 1,
                },
                {
                  name: 'leadTimeDays',
                  type: 'number',
                  dbName: 'lead_days', // 9 chars
                  admin: {
                    description: 'Production time in business days',
                  },
                },
                {
                  name: 'rushAvailable',
                  type: 'checkbox',
                  dbName: 'rush_avail', // 10 chars
                
                },
                {
                  name: 'rushLeadTimeDays',
                  type: 'number',
                  dbName: 'rush_days', // 9 chars
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
              admin: {
                description: 'Base cost from supplier',
              },
            },
            {
              name: 'pricing',
              type: 'group',
              fields: [
                
                {
                  name: 'markupType',
                  type: 'select',
                  dbName: 'markup_type', // 11 chars
                  
                  options: [
                    { label: 'Percentage', value: 'percentage' },
                    { label: 'Fixed Amount', value: 'fixed' },
                    { label: 'Tiered', value: 'tiered' },
                  ],
                },
                {
                  name: 'markupValue',
                  type: 'number',
                  dbName: 'markup_val', // 10 chars
                  admin: {
                    description: 'Markup percentage or fixed amount',
                    condition: (data) => data?.pricing?.markupType !== 'tiered',
                  },
                },
                {
                  name: 'suggestedRetailPrice',
                  type: 'number',
                  dbName: 'srp', // 3 chars
                  admin: {
                    description: 'Suggested selling price',
                  },
                },
              ],
            },
            {
              name: 'pricingTiers',
              type: 'array',
              dbName: 'price_tiers', // 11 chars
              admin: {
                condition: (data) => data?.pricing?.markupType === 'tiered',
              },
              fields: [
                {
                  name: 'minQuantity',
                  type: 'number',
                  dbName: 'min_qty', // 7 chars
                  required: true,
                },
                {
                  name: 'maxQuantity',
                  type: 'number',
                  dbName: 'max_qty', // 7 chars
                },
                {
                  name: 'markupPercentage',
                  type: 'number',
                  dbName: 'markup_pct', // 10 chars
                  required: true,
                },
              ],
            },
            {
              name: 'additionalCosts',
              type: 'group',
              dbName: 'add_costs', // 9 chars
              fields: [
                {
                  name: 'printingCostPerArea',
                  type: 'number',
                  dbName: 'print_cost', // 10 chars
                 
                  admin: {
                    description: 'Additional cost per printed area',
                  },
                },
                {
                  name: 'setupFee',
                  type: 'number',
                 
                  admin: {
                    description: 'One-time setup fee if applicable',
                  },
                },
                {
                  name: 'rushSurcharge',
                  type: 'number',
                  dbName: 'rush_charge', // 11 chars
                 
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
              admin: {
                description: 'Brief product description',
              },
            },
            {
              name: 'features',
              type: 'richText',
              editor: lexicalEditor(),
              admin: {
                description: 'Detailed features and benefits',
              },
            },
            {
              name: 'materials',
              type: 'group',
              fields: [
                {
                  name: 'primary',
                  type: 'text',
                  admin: {
                    description: 'e.g., "100% Cotton", "Ceramic", "Polyester Blend"',
                  },
                },
                {
                  name: 'weight',
                  type: 'text',
                  admin: {
                    description: 'e.g., "5.3 oz/yd²", "150 GSM"',
                  },
                },
                {
                  name: 'construction',
                  type: 'text',
                  admin: {
                    description: 'e.g., "Ring-spun", "Jersey knit", "Woven"',
                  },
                },
                {
                  name: 'finish',
                  type: 'text',
                  admin: {
                    description: 'e.g., "Matte", "Glossy", "Soft-touch"',
                  },
                },
              ],
            },
            {
              name: 'careInstructions',
              type: 'array',
              dbName: 'care', // 4 chars
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
              dbName: 'phys_dims', // 9 chars
              label: 'Physical Product Dimensions',
              fields: [
                { 
                  name: 'widthInches', 
                  type: 'number',
                  dbName: 'width_in', // 8 chars
                  admin: {
                    description: 'Width in inches',
                  },
                },
                { 
                  name: 'heightInches', 
                  type: 'number',
                  dbName: 'height_in', // 9 chars
                  admin: {
                    description: 'Height in inches',
                  },
                },
                { 
                  name: 'depthInches', 
                  type: 'number',
                  dbName: 'depth_in', // 8 chars
                  admin: {
                    description: 'Depth/thickness (for 3D products)',
                  },
                },
                {
                  name: 'diameter',
                  type: 'number',
                  admin: {
                    description: 'For cylindrical products (inches)',
                  },
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
              dbName: 'shipping', // 8 chars
              fields: [
                { 
                  name: 'weight', 
                  type: 'number', 
                  required: true,
                  admin: {
                    description: 'Weight in ounces',
                  },
                },
                { 
                  name: 'shippingDimensions', 
                  type: 'text',
                  dbName: 'ship_dims', // 9 chars
                  admin: {
                    description: 'e.g., "10x13x3 inches"',
                  },
                },
                {
                  name: 'packageType',
                  type: 'select',
                  dbName: 'pack_type', // 9 chars
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
              dbName: 'colors', // 6 chars
              label: 'Color Options',
              minRows: 1,
              admin: {
                description: 'Available product colors',
              },
              fields: [
                {
                  name: 'colorName',
                  type: 'text',
                  dbName: 'name', // 4 chars
                  required: true,
                },
                {
                  name: 'colorHex',
                  type: 'text',
                  dbName: 'hex', // 3 chars
                  required: true,
                  admin: {
                    description: 'Hex color code (e.g., #FFFFFF)',
                  },
                },
                {
                  name: 'isPrimary',
                  type: 'checkbox',
                  dbName: 'is_primary', // 10 chars
                  admin: {
                    description: 'Set as default color',
                  },
                },
              ],
            },
            {
              name: 'sizeOptions',
              type: 'array',
              dbName: 'sizes', // 5 chars
              label: 'Size Options',
              minRows: 1,
              fields: [
                {
                  name: 'sizeName',
                  type: 'text',
                  dbName: 'name', // 4 chars
                  required: true,
                  admin: {
                    description: 'e.g., "Small", "Medium", "Large", "11oz", "16x20"',
                  },
                },
                {
                  name: 'sizeDescription',
                  type: 'textarea',
                  dbName: 'desc', // 4 chars
                },
                {
                  name: 'dimensions',
                  type: 'group',
                  dbName: 'dims', // 4 chars
                  fields: [
                    { name: 'width', type: 'number' },
                    { name: 'height', type: 'number' },
                  ],
                },
              ],
            },
            {
              name: 'sizeChart',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Size chart image for customer reference',
              },
            },
          ],
        },

        // =====================================
        // CUSTOMIZATION TAB
        // =====================================
        {
          label: 'Customization',
          fields: [
            {
              name: 'surfaceConf',
              type: 'group',
              dbName: 'surf_config', // 11 chars
              label: 'Surface Rendering Configuration',
              fields: [
                {
                  name: 'renderType',
                  type: 'select',
                  dbName: 'render_type', // 11 chars
                  required: true,
                  defaultValue: 'flat',
                  options: [
                    { label: 'Flat Surface', value: 'flat' },
                    { label: 'Cylindrical Surface', value: 'cylindrical' },
                    { label: 'Conical Surface', value: 'conical' },
                    { label: 'Spherical Surface', value: 'spherical' },
                    { label: 'Complex 3D', value: 'complex_3d' },
                  ],
                },
                {
                  name: 'surfaceProp',
                  type: 'group',
                  dbName: 'surf_props', // 10 chars
                  fields: [
                    {
                      name: 'wrapAngle',
                      type: 'number',
                      dbName: 'wrap_angle', // 10 chars
                      defaultValue: 280,
                      min: 0,
                      max: 360,
                      admin: {
                        description: 'For cylindrical products: how many degrees the design wraps',
                      },
                    },
                    {
                      name: 'curveIntnsty',
                      type: 'number',
                      dbName: 'curve_int', // 9 chars
                      min: 0,
                      max: 1,
                      defaultValue: 0.8,
                      admin: {
                        description: 'How much perspective distortion to apply',
                        step: 0.1,
                      },
                    },
                    {
                      name: 'designRatio',
                      type: 'group',
                      dbName: 'design_ratio', // 12 chars
                      fields: [
                        {
                          name: 'widthRatio',
                          type: 'number',
                          dbName: 'width_ratio', // 11 chars
  
                          min: 0.1,
                          max: 2.0,
                        },
                        {
                          name: 'heightRatio',
                          type: 'number',
                          dbName: 'height_ratio', // 12 chars
                      
                          min: 0.1,
                          max: 2.0,
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'blendSetting',
                  type: 'group',
                  dbName: 'blend_sets', // 10 chars
                  fields: [
                    {
                      name: 'defBlendMode',
                      type: 'select',
                      dbName: 'blend_mode', // 10 chars
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
                      dbName: 'opacity', // 7 chars
                      min: 0.1,
                      max: 1.0,
                   
                    },
                    {
                      name: 'preserveColors',
                      type: 'checkbox',
                      dbName: 'preserve_colors', // 15 chars
                      defaultValue: true,
                    },
                  ],
                },
              ],
            },
            {
              name: 'printTech',
              type: 'array',
              dbName: 'print_techs', // 11 chars
              label: 'Printing Technologies',
              admin: {
                description: 'Available printing methods and their areas',
              },
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
                  name: 'techName',
                  type: 'select',
                  dbName: 'tech_name', // 9 chars
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
                  name: 'printConstraints',
                  type: 'group',
                  dbName: 'constraints', // 11 chars
                  fields: [
                    {
                      name: 'dpiReq',
                      type: 'group',
                      dbName: 'dpi_reqs', // 8 chars
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
                      dbName: 'size_limits', // 11 chars
                      fields: [
                        {
                          name: 'minWidInch',
                          type: 'number',
                          dbName: 'min_width', // 9 chars
                          defaultValue: 1.0,
                        },
                        {
                          name: 'minHtInch',
                          type: 'number',
                          dbName: 'min_height', // 10 chars
                          defaultValue: 1.0,
                        },
                        {
                          name: 'maxWidInch',
                          type: 'number',
                          dbName: 'max_width', // 9 chars
                        },
                        {
                          name: 'maxHtInch',
                          type: 'number',
                          dbName: 'max_height', // 10 chars
                        },
                      ],
                    },
                    {
                      name: 'colorLimits',
                      type: 'group',
                      dbName: 'color_limits', // 12 chars
                      fields: [
                        {
                          name: 'maxColors',
                          type: 'number',
                          dbName: 'max_colors', // 10 chars
                          admin: {
                            description: 'Leave empty for unlimited colors',
                          },
                        },
                        {
                          name: 'supportsFullColor',
                          type: 'checkbox',
                          dbName: 'full_color', // 10 chars
                          defaultValue: true,
                        },
                      ],
                    },
                  ],
                },

                // =====================================
                // MOCKUP PHOTOS AT TECHNOLOGY LEVEL
                // =====================================
                {
                  name: 'mockupPhotos',
                  type: 'array',
                  dbName: 'mockups', // 7 chars
                  label: 'Technology Mockup Photos',
                  admin: {
                    description: 'All mockup photos for this printing technology',
                  },
                  fields: [
                    { 
                      name: 'title', 
                      type: 'text', 
                      label: 'Mockup Title',
                     
                      admin: {
                        description: 'e.g., "Front View", "3/4 Angle", "Lifestyle Shot"',
                      },
                    },
                    {
                      name: 'photo',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Mockup Photo',
                      required: true,
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
                      dbName: 'mtype', // 4 chars
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
                      dbName: 'color', // 5 chars
                      label: 'Product Color (Hex)',
                      required: true,
                      admin: {
                        description: 'Color of the product in this mockup (e.g., #000000)',
                      },
                    },
                    {
                      name: 'visibleAreas',
                      type: 'array',
                      dbName: 'visible_areas', // 13 chars
                      label: 'Visible Areas',
                 
                      minRows: 0,
                      admin: {
                        description: 'All customization areas visible in this mockup',
                      },
                      fields: [
                        {
                          name: 'areaName',
                          type: 'text',
                          dbName: 'area', // 4 chars
                          required: true,
                          admin: {
                            description: 'Must match area name in customization areas below',
                          },
                        },
                        {
                          name: 'visibility',
                          type: 'select',
                          defaultValue: 'full',
                          options: [
                            { label: 'Fully Visible', value: 'full' },
                            { label: 'Partially Visible', value: 'partial' },
                            { label: 'Edge/Wrap Visible', value: 'edge' },
                          ],
                          
                        },
                        {
                          name: 'desgnPlacment',
                          type: 'group',
                          dbName: 'placement', // 9 chars
                          label: 'Design Placement Configuration',
                          fields: [
                            {
                              name: 'coord',
                              type: 'group',
                              dbName: 'coords', // 6 chars
                              label: 'Base Coordinates (0.0-1.0)',
                              fields: [
                                { name: 'x', type: 'number', min: 0, max: 1, required: true },
                                { name: 'y', type: 'number', min: 0, max: 1, required: true },
                                { name: 'width', type: 'number', min: 0, max: 1, required: true },
                                { name: 'height', type: 'number', min: 0, max: 1, required: true },
                              ],
                            },
                            {
                              name: 'transforms',
                              type: 'group',
                              dbName: 'tfms', // 4 chars
                              fields: [
                                { name: 'rotation', type: 'number', defaultValue: 0 },
                                { name: 'skewX', type: 'number', dbName: 'skew_x', defaultValue: 0 },
                                { name: 'skewY', type: 'number', dbName: 'skew_y', defaultValue: 0 },
                                { name: 'scaleX', type: 'number', dbName: 'scale_x', defaultValue: 1 },
                                { name: 'scaleY', type: 'number', dbName: 'scale_y', defaultValue: 1 },
                              ],
                            },
                            {
                              name: 'renderSettings',
                              type: 'group',
                              dbName: 'render_sets', // 11 chars
                              fields: [
                                {
                                  name: 'blendMode',
                                  type: 'select',
                                  dbName: 'blend', // 5 chars
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
                                  min: 0.1,
                                  max: 1,
                                  
                                },
                                {
                                  name: 'preserveColors',
                                  type: 'checkbox',
                                  dbName: 'preserve_col', // 12 chars
                                
                                },
                              ],
                            },
                            {
                              name: 'surfSpecs',
                              type: 'group',
                              dbName: 'surf_spec', // 9 chars
                              fields: [
                                {
                                  name: 'wrapSettng',
                                  type: 'group',
                                  dbName: 'wrap_sets', // 9 chars
                                  fields: [
                                    {
                                      name: 'enableWrap',
                                      type: 'checkbox',
                                      dbName: 'enable_wrap', // 11 chars
                                     
                                    },
                                    {
                                      name: 'wrapAngle',
                                      type: 'number',
                                      dbName: 'wrap_angle', // 10 chars
                                      min: 0,
                                      max: 360,
                                      defaultValue: 280,
                                    },
                                    {
                                      name: 'wrapIntensity',
                                      type: 'number',
                                      dbName: 'wrap_int', // 8 chars
                                      min: 0,
                                      max: 1,
                                      defaultValue: 0.8,
                                    },
                                  ],
                                },
                                {
                                  name: 'perspCorrection',
                                  type: 'group',
                                  dbName: 'persp_corr', // 10 chars
                                  fields: [
                                    {
                                      name: 'enablePersp',
                                      type: 'checkbox',
                                      dbName: 'enable_persp', // 12 chars
                                      defaultValue: false,
                                    },
                                    {
                                      name: 'perspIntensity',
                                      type: 'number',
                                      dbName: 'persp_int', // 9 chars
                                      min: 0,
                                      max: 1,
                                      defaultValue: 0.5,
                                    },
                                  ],
                                },
                              ],
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
                        description: 'Higher priority mockups appear first',
                      },
                    },
                    {
                      name: 'tags',
                      type: 'array',
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
                // CUSTOMIZATION AREAS
                // =====================================
                {
                  name: 'customizationAreas',
                  type: 'array',
                  dbName: 'areas', // 5 chars
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
                      dbName: 'name', // 4 chars
                      required: true,
                      admin: {
                        description: 'e.g., "Front", "Back", "Mug", "Left Sleeve"',
                      },
                    },
                    {
                      name: 'areaType',
                      type: 'select',
                      dbName: 'atype', // 4 chars
                      options: [
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                        { label: 'Accent', value: 'accent' },
                      ],
                      defaultValue: 'primary',
                    },
                    {
                      name: 'canvasDimensions',
                      type: 'group',
                      dbName: 'canvas_dims', // 11 chars
                      fields: [
                        {
                          name: 'widthInches',
                          type: 'number',
                          dbName: 'width_in', // 8 chars
                          required: true,
                        },
                        {
                          name: 'heightInches',
                          type: 'number',
                          dbName: 'height_in', // 9 chars
                          required: true,
                        },
                        {
                          name: 'canvasPixelWidth',
                          type: 'number',
                          dbName: 'canvas_w', // 8 chars
                          defaultValue: 800,
                        },
                        {
                          name: 'canvasPixelHeight',
                          type: 'number',
                          dbName: 'canvas_h', // 8 chars
                          defaultValue: 600,
                        },
                        {
                          name: 'aspectRatioLocked',
                          type: 'checkbox',
                          dbName: 'aspect_lock', // 11 chars
                          defaultValue: true,
                        },
                      ],
                    },
                    {
                      name: 'designCanvasPhotos',
                      type: 'array',
                      dbName: 'canvas_photos', // 13 chars
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
                          dbName: 'color', // 5 chars
                          admin: {
                            description: 'Product color hex for this canvas photo',
                          },
                        },
                        {
                          name: 'printableAreaCoordinates',
                          type: 'group',
                          dbName: 'print_coords', // 12 chars
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
                      fields: [
                        {
                          name: 'minElementSize',
                          type: 'group',
                          dbName: 'min_size', // 8 chars
                          fields: [
                            { name: 'width', type: 'number' },
                            { name: 'height', type: 'number' },
                          ],
                        },
                        {
                          name: 'maxElements',
                          type: 'number',
                          dbName: 'max_elem', // 8 chars
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'areaSyncRules',
              type: 'array',
              dbName: 'sync_rules', // 10 chars
              label: 'Design Synchronization Rules',
              fields: [
                {
                  name: 'ruleName',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'sourceArea',
                  type: 'text',
                  dbName: 'source', // 6 chars
                  required: true,
                },
                {
                  name: 'targetAreas',
                  type: 'array',
                  dbName: 'targets', // 7 chars
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
                  dbName: 'sync_type', // 9 chars
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
              dbName: 'gallery', // 7 chars
              label: 'Product Gallery',
              minRows: 1,
              maxRows: 10,
              admin: {
                description: 'Product photos for listings',
              },
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
              fields: [
                {
                  name: 'metaTitle',
                  type: 'text',
                  dbName: 'meta_title', // 10 chars
                },
                {
                  name: 'metaDescription',
                  type: 'textarea',
                  dbName: 'meta_desc', // 9 chars
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  // =====================================
  // INDEXES
  // =====================================

  // =====================================
  // HOOKS
  // =====================================
  hooks: {
    beforeChange: [
      async ({ data, originalDoc }) => {
        // Auto-calculate suggested retail price
        if (data?.cost && data?.pricing?.markupType) {
          if (data.pricing.markupType === 'percentage' && data.pricing.markupValue) {
            data.pricing = {
              ...data.pricing,
              suggestedRetailPrice: data.cost * (1 + data.pricing.markupValue / 100)
            };
          } else if (data.pricing.markupType === 'fixed' && data.pricing.markupValue) {
            data.pricing = {
              ...data.pricing,
              suggestedRetailPrice: data.cost + data.pricing.markupValue
            };
          }
        }

        return data;
      },
    ],
  },
};