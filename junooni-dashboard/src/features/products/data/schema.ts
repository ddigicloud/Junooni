import { z } from 'zod';

/** 
 * Schema for an option value within a variant 
 * (e.g., { optionId: "123", optionName: "Color", value: "Blue" })
 */
const VariantOptionValueSchema = z.object({
  optionId: z.string().optional(),
  optionName: z.string().min(1),
  value: z.string().min(1),
});

/** 
 * Schema for a product option (e.g. "Color") and its possible values (e.g. ["Red", "Blue"]) 
 */
const ProductOptionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Option name is required" }),
  optionValues: z.array(z.string()).default([]),
});

/** 
 * Schema for a product variant (e.g. "Small / Blue")
 */
const ProductVariantSchema = z.object({
  id: z.string(),
  title: z.string().min(1, { message: "Variant title is required" }),
  price: z.number().min(0, { message: "Price must be 0 or greater" }),
  compareAtPrice: z.union([z.number().min(0), z.nan()]).optional(),
  stock: z.number().min(0, { message: "Stock must be 0 or greater" }),
  sku: z.string().min(1, { message: "SKU is required" }),
  allowBackorder: z.boolean().default(false),
  manageInventory: z.boolean().default(true),
  optionValues: z.array(VariantOptionValueSchema),
});

/**
 * Schema for product dimensions
 */

/**
 * Main product schema aligned with the EditProduct component
 */
export const ProductSchema = z.object({
  // Basic product information
  id: z.string().optional(),
  title: z.string().min(1, { message: "Product title is required" }),
  name: z.string().optional(), // Alias for title in some contexts
  handle: z.string().optional(),
  description: z.string().optional(),
  
  // Status and categorization
  status: z.enum(['published', 'draft', 'archived']).default('published'),
  category: z.string().optional(),
  
  // Pricing and inventory (used mainly for simple products)
  // price: z.union([z.number().min(0), z.nan()]).optional(),
  discountable: z.boolean().default(true),
  
  // Media
  thumbnail: z.string().optional(),
  images: z.array(
    z.object({
      id: z.string().optional(),
      url: z.string(),
      rank: z.number().optional(),
    })
  ).optional(),
  
  // Physical attributes
  weight: z.union([z.string(), z.number()]).optional(),
  length: z.union([z.string(), z.number()]).optional(),
  width: z.union([z.string(), z.number()]).optional(), 
  height: z.union([z.string(), z.number()]).optional(),
  material: z.string().optional(),
  origin_country: z.string().optional(),
  
  // Options and variants (for configurable products)
  options: z.array(ProductOptionSchema).optional(),
  variants: z.array(ProductVariantSchema).optional(),
}).refine(
  (data) => {
    // If we have variants, ensure they all have proper option values
    if (data.variants && data.variants.length > 0) {
      // If we have options, each variant should have matching option values
      if (data.options && data.options.length > 0) {
        return data.variants.every(variant => 
          variant.optionValues.length === data.options!.length
        );
      }
      return true;
    }
    return true;
  },
  {
    message: "Each variant must have values for each defined option",
    path: ["variants"],
  }
);

export type Product = z.infer<typeof ProductSchema>;

// Types for API responses
export interface ApiOption {
  id?: string;
  title: string;
  values?: Array<{ value: string; id?: string }>;
}

export interface ApiOptionValue {
  id?: string;
  value: string;
  option?: {
    id?: string;
    title: string;
  };
}

export interface ApiVariant {
  id: string;
  title: string;
  sku?: string;
  inventory_quantity?: number;
  allow_backorder?: boolean;
  manage_inventory?: boolean;
  compare_at_price?: number;
  options?: ApiOptionValue[];
  prices?: Array<{
    id?: string;
    amount: number;
    currency_code: string;
  }>;
}

export interface ApiImage {
  id?: string;
  url: string;
  rank?: number;
}