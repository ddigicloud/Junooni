// src/features/products/data/types.ts

export interface ApiOption {
    id: string;
    title: string;
    product_id?: string;
    values?: Array<{
      id?: string;
      value: string;
      option_id?: string;
    }>;
  }
  
  export interface ApiOptionValue {
    id?: string;
    value: string;
    option_id?: string;
    option?: {
      id: string;
      title: string;
      product_id?: string;
    };
  }
  
  export interface ApiVariant {
    id: string;
    title: string;
    sku?: string;
    product_id?: string;
    options?: ApiOptionValue[];
    prices?: Array<{
      id?: string;
      amount: number;
      currency_code: string;
      variant_id?: string;
    }>;
  }
  
  export interface ApiImage {
    id?: string;
    url: string;
    rank?: number;
    product_id?: string;
  }
  
  export interface ApiProduct {
    id: string;
    title: string;
    description?: string;
    handle?: string;
    status: string;
    weight?: string;
    options?: ApiOption[];
    variants?: ApiVariant[];
    images?: ApiImage[];
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  }