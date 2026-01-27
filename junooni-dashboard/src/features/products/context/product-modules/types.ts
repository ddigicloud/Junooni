// ../context/product-components/types.ts

// export interface OptionValue {
//     optionId: string;
//     optionName: string;
//     value: string;
//   }
  
//   export interface Variant {
//     id: string;
//     title: string;
//     price: number | string;
//     compareAtPrice?: number | string;
//     stock: number | string;
//     sku: string;
//     allowBackorder?: boolean;
//     manageInventory?: boolean;
//     optionValues: OptionValue[];
//     [key: string]: any;
//   }
  
//   export interface Option {
//     id: string;
//     title: string;
//     optionValues: string[];
//     colorHexValues?: Record<string, string>;
//     imageAssociation?: boolean;
//     [key: string]: any;
//   }
// ../context/product-components/types.ts

// Variant option value - used in variants to specify which option and value
export interface VariantOptionValue {
  id?: string;
  optionId?: string;
  optionName?: string;
  value: string;
  [k: string]: any;
}

// Option definition - contains the option title and possible string values
export interface Option {
  id: string;
  title: string;
  optionValues: string[]; // Array of strings like ["Red", "Blue", "Green"]
  imageAssociation?: boolean;
  colorHexValues?: Record<string, string>; // Maps option value strings to hex colors
  [k: string]: any;
}

// Variant - references option values by optionName and value
export interface Variant {
  id: string;
  sku?: string;
  title?: string;
  price?: number | string;
  compareAtPrice?: number | string;
  stock?: number | string;
  allowBackorder?: boolean;
  manageInventory?: boolean;
  optionValues: VariantOptionValue[]; // Array of objects with optionName and value
  [k: string]: any;
}

export interface VariantInfo {
  optionId?: string;
  optionName?: string;
  optionValues?: string[];
  variantId?: string;
  variantTitle?: string;
}

export interface MediaItem {
  file?: File | null;
  url: string;
  rank: number;
  id?: string;  // ✅ ADD THIS LINE
  isNew: boolean;
  colorValue?: string;
  variantInfo?: VariantInfo | null;
}

export interface ProductDetail {
  id: string;
  text: string;
}

export interface ProductFormValues {
  title: string;
  subtitle?: string;
  handle: string;
  description: string;
  status: string;
  thumbnail: string;
  discountable: boolean;
  category_id: string;
  options: Option[];
  variants: Variant[];
  defaultVariantPrice: number | string;
  defaultVariantSku: string;
  defaultVariantStock: number | string;
  weight: string;
  length: string;
  width: string;
  height: string;
  material: string;
  origin_country: string;
  productDetails: ProductDetail[];
  storyBehindDesign: string;
  locationId: string;
  metadata?: Record<string, any>;
  shippingDays?: string;
  handlingTime?: string;
}

export interface ProductFormProps {
  initialData?: ProductFormValues;
  isEditing?: boolean;
}

// Add Product type that was missing
export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  handle: string;
  description?: string;
  status: string;
  thumbnail?: string;
  discountable?: boolean;
  category_id?: string;
  options?: Option[];
  variants?: Variant[];
  [k: string]: any;
}