// import type { CollectionConfig } from 'payload'
// import { lexicalEditor } from '@payloadcms/richtext-lexical';
// import { anyone } from '../access/anyone'
// import { authenticated } from '../access/authenticated'
// import { slugField } from '@/fields/slug'

// export const Categories: CollectionConfig = {
//   slug: 'categories',
//   access: {
//     create: authenticated,
//     delete: authenticated,
//     read: anyone,
//     update: authenticated,
//   },
//   admin: {
//     useAsTitle: 'title',
//   },
//   fields: [
//     {
//       name: 'title',
//       type: 'text',
//       required: true,
//     },
//     {
//         name: 'description',

//         type: 'richText',
//         editor: lexicalEditor(),
//       },
//     ...slugField(),
//   ],
// }


// /payload/collections/Categories.ts
import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'blank-products',
      hasMany: true,
      admin: {
        position: 'sidebar',
       
      },
    },
    ...slugField(),
    
  ],
}
