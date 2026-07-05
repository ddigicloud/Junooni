// // Core data types
// export interface Vendor {
//     id: string;
//     name: string;
//     handle: string;
//     logo?: string;
//     coverphoto?: string;
//     creator_title?: string;
//     creator_bio?: string;
//     instagram?: string;
//     xtwitter?: string;
//     youtube?: string;
//     othersocial?: string;
//   }
  
//   export interface VendorResponse {
//     id: string;
//     products?: Product[];
//     [key: string]: any;
//   }
  
//   export interface Product {
//     id: string;
//     title?: string;
//     handle?: string;
//     thumbnail?: string;
//     status?: string;
//     is_giftcard?: boolean;
//     type?: string;
//     variants?: ProductVariant[];
//     options?: ProductOption[];
//     collection?: {
//       id: string;
//     };
//     created_at?: string;
//     discountable?: boolean;
//     material?: string;
//   }
  
//   export interface ProductOption {
//     title: string;
//     values?: string[];
//   }
  
//   export interface ProductVariant {
//     id: string;
//     title: string;
//     price?: number;
//   }
  
//   // Creator-specific interfaces
//   export interface Creator {
//     id: string;
//     name: string;
//     handle: string;
//     role: string;
//     verified: boolean;
//     followers: number;
//     bio: string;
//     shortBio: string;
//     profileImage: string;
//     coverImage: string;
//     socialMedia: {
//       instagram: string | null;
//       twitter: string | null;
//       youtube: string | null;
//       website: string | null;
//     };
//     upcomingDrops: Array<{
//       date: string;
//       title: string;
//     }>;
//     stats: {
//       products: number;
//       limitedEditions: number;
//       exclusives: number;
//     };
//   }
  
//   // Component Props interfaces
//   export interface CreatorStorePageProps {
//     vendor: Vendor | Vendor[];
//     region?: string;
//   }
  
//   export interface TabButtonProps {
//     active: boolean;
//     onClick: () => void;
//     children: React.ReactNode;
//   }
  
//   export interface FAQItemProps {
//     question: string;
//     children: React.ReactNode;
//   }
  
//   export interface DynamicProductCardProps {
//     product: Product;
//     hasProductBadge: (product: Product, badgeType: string) => boolean;
//   }
  
//   // Animation type definitions
//   export const fadeIn = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { duration: 0.6 } }
//   };
  
//   export const slideIn = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
//   };
  
//   export const staggerContainer = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1
//       }
//     }
//   };



// Core data types
export interface Vendor {
  id: string;
  name: string;
  handle: string;
  logo?: string;
  coverphoto?: string;
  creator_title?: string;
  creator_bio?: string;
  instagram?: string;
  xtwitter?: string;
  facebook?: string;
  youtube?: string;
  othersocial?: string;
  verified?: string | boolean;
  [key: string]: any;
}

export interface VendorResponse {
  id: string;
  products?: Product[];
  [key: string]: any;
}

export interface Product {
  id: string;
  title?: string;
  handle?: string;
  thumbnail?: string;
  status?: string;
  is_giftcard?: boolean;
  type?: string;
  variants?: ProductVariant[];
  options?: ProductOption[];
  collection?: {
    id: string;
  };
  created_at?: string;
  discountable?: boolean;
  material?: string;

  // Populated via *vendor,*tags,*metadata,*variants.calculated_price in listProducts()
  vendor?: {
    id: string;
    name: string;
    handle?: string;
    verified?: string | boolean;
    [key: string]: any;
  };
  tags?: { id: string; value: string }[];
  metadata?: Record<string, any>;
  images?: { id?: string; url: string }[];
}

export interface ProductOption {
  title: string;
  // values can be raw strings or objects depending on API response shape
  values?: (string | { title?: string; value?: string })[];
}

export interface ProductVariant {
  id: string;
  title: string;
  price?: number;

  calculated_price?:
    | {
        calculated_amount?: number;
        original_amount?: number;
        amount?: number;
        price_incl_tax?: number;
        price_excl_tax?: number;
        [currencyCode: string]: any;
      }
    | number;
  prices?: { amount: number; currency_code: string }[];
  metadata?: Record<string, any>;
}

// Creator-specific interfaces
export interface Creator {
  id: string;
  name: string;
  handle: string;
  role: string;
  verified: boolean;
  followers: number;
  bio: string;
  shortBio: string;
  profileImage: string;
  coverImage: string;
  socialMedia: {
    instagram: string | null;
    twitter: string | null;
    facebook: string | null;
    youtube: string | null;
    website: string | null;
  };
  upcomingDrops: Array<{
    date: string;
    title: string;
  }>;
  stats: {
    products: number;
    limitedEditions: number;
    exclusives: number;
  };
}

// Component Props interfaces
export interface CreatorStorePageProps {
  vendor: Vendor | Vendor[];
  region?: {
    id: string;
    currency_code?: string;
    [key: string]: any;
  };
  vendorProducts?: Product[];
  reviewsMap?: Record<string, { averageRating: number; reviewCount: number }>;
}

export interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

export interface DynamicProductCardProps {
  product: Product;
  hasProductBadge: (product: Product, badgeType: string) => boolean;
}

// Animation type definitions
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

export const slideIn = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};