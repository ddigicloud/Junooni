// import type { GlobalConfig } from 'payload'

// import { link } from '@/fields/link'
// import { revalidateHeader } from './hooks/revalidateHeader'

// export const Header: GlobalConfig = {
//   slug: 'header',
//   access: {
//     read: () => true,
//   },
//   fields: [
//     {
//       name: 'navItems',
//       type: 'array',
//       fields: [
//         link({
//           appearances: false,
//         }),
//       ],
//       maxRows: 6,
//       admin: {
//         initCollapsed: true,
//         components: {
//           RowLabel: '@/Header/RowLabel#RowLabel',
//         },
//       },
//     },
//   ],
//   hooks: {
//     afterChange: [revalidateHeader],
//   },
// }

import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
          disableLabel: false,
        }),
        // First level children
        {
          name: 'children',
          type: 'array',
          label: 'Child Nav Items',
          maxRows: 20,
          fields: [
            link({
              appearances: false,
              disableLabel: false,
            }),
            // Second level children (with unique name)
            {
              name: 'subChildren', // ⭐ Different name to avoid conflict
              type: 'array',
              label: 'Sub-Items',
              maxRows: 20,
              fields: [
                link({
                  appearances: false,
                  disableLabel: false,
                }),
              ],
              admin: {
                initCollapsed: true,
                description: 'Add sub-items (third level navigation)',
                components: {
                  RowLabel: '@/Header/RowLabel#SubChildRowLabel',
                },
              },
            },
          ],
          admin: {
            initCollapsed: true,
            description: 'Add child navigation items that will appear in the dropdown',
            components: {
              RowLabel: '@/Header/RowLabel#ChildRowLabel',
            },
          },
        },
      ],
      maxRows: 10,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}