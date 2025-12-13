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
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
               
            },
     {
                      name: 'featuredCategory',
                      type: 'checkbox',
                      //dbName: 'not_mockup_compatible',
                      defaultValue: false,
                      admin: {
        position: 'sidebar',
        description: 'Mark this category as featured to display it on the homepage of catalog',
       
      },
                    },    
                    {
                      name: 'StudioCategory',
                      type: 'checkbox',
                      //dbName: 'not_mockup_compatible',
                      defaultValue: true,
                      admin: {
        position: 'sidebar',
        description: 'Mark this category to show on the studio navigation',
       
      },
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
