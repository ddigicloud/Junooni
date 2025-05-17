// ../context/product-components/types.ts

export interface OptionValue {
    optionId: string;
    optionName: string;
    value: string;
  }
  
  export interface Variant {
    id: string;
    title: string;
    price: number | string;
    compareAtPrice?: number | string;
    stock: number | string;
    sku: string;
    allowBackorder?: boolean;
    manageInventory?: boolean;
    optionValues: OptionValue[];
    [key: string]: any;
  }
  
  export interface Option {
    id: string;
    title: string;
    optionValues: string[];
    colorHexValues?: Record<string, string>;
    imageAssociation?: boolean;
    [key: string]: any;
  }
  
  export interface VariantInfo {
    optionId?: string;
    optionName?: string;
    optionValues?: string[];
    variantId?: string;
    variantTitle?: string;
  }
  
  export interface MediaItem {
    file?: File;
    url: string;
    rank: number;
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