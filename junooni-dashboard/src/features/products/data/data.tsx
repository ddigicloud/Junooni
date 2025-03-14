import {
    IconBox,
    IconMug,
    IconDeviceMobile,
    IconCheck,
    IconX,
    IconClock,
    IconDiscountCheck,
    IconDiscount2,
    IconStar,
    IconStarHalf,
    IconStarOff
  } from '@tabler/icons-react'
  
  // Product Categories
  export const categories = [
    {
      value: 'electronics',
      label: 'Electronics',
      icon: IconDeviceMobile,
    },

    {
      value: 'home_decor',
      label: 'Home Decor',
      icon: IconBox,
    },
    
    {
      value: 'drinkware',
      label: 'Drinkware',
      icon: IconMug,
    },
  ]
  
  // Product Availability Status
  export const availabilityStatuses = [
    {
      value: 'in_stock',
      label: 'In Stock',
      icon: IconCheck,
    },
    {
      value: 'out_of_stock',
      label: 'Out of Stock',
      icon: IconX,
    },
    {
      value: 'pre_order',
      label: 'Pre-Order',
      icon: IconClock,
    },
  ]
  
  // Product Discounts
  export const discountTypes = [
    {
      value: 'none',
      label: 'No Discount',
      icon: IconDiscount2,
    },
    {
      value: 'percentage',
      label: 'Percentage Off',
      icon: IconDiscountCheck,
    },
    {
      value: 'fixed',
      label: 'Fixed Amount Off',
      icon: IconDiscountCheck,
    },
  ]
  
  // Product Ratings
  export const ratings = [
    {
      value: 5,
      label: 'Excellent',
      icon: IconStar,
    },
    {
      value: 4,
      label: 'Good',
      icon: IconStarHalf,
    },
    {
      value: 3,
      label: 'Average',
      icon: IconStarHalf,
    },
    {
      value: 2,
      label: 'Poor',
      icon: IconStarOff,
    },
    {
      value: 1,
      label: 'Terrible',
      icon: IconStarOff,
    },
  ]
  