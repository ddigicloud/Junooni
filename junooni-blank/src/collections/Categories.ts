import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access:{
    read: () => true
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
    },
        // Optional: allow subcategories by referencing parent
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      required: false,
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'blank-products',
      hasMany: true,
      label: 'Products',
      
      hooks: {
        beforeChange: [
          // This field will be populated by a hook that runs when products are updated
        ]
      }
    },
  ],
}
