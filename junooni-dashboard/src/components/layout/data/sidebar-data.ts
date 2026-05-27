// import {
//   IconBarrierBlock,
//   IconBrowserCheck,
//   IconBug,
//   IconError404,
//   IconHelp,
//   IconLayoutDashboard,
//   IconLock,
//   IconLockAccess,
//   IconMessages,
//   IconNotification,
//   IconPalette,
//   IconServerOff,
//   IconSettings,
//   IconTool,
//   IconUserCog,
//   IconUserOff,
//   IconUsers,
//   IconTag,
//   IconShoppingCart,
//   IconBuildingStore,
//   IconFolderOpen,
//   IconCrown,
// } from '@tabler/icons-react'
// import { type SidebarData } from '../types'

// const JUNOONI_ADMIN_VENDOR_ID = '01KJ50176GDA5B0W7228VZNSR8'

// export const getSidebarData = (vendorId?: string): SidebarData => {
//   return {
//     user: {
//       name: 'satnaing',
//       email: 'satnaingdev@gmail.com',
//       avatar: '/avatars/shadcn.jpg',
//     },
//     navGroups: [
//       {
//         title: 'General',
//         items: [
//           {
//             title: 'Dashboard',
//             url: '/dashboard',
//             icon: IconLayoutDashboard,
//           },
//           {
//             title: 'Products',
//             url: '/products',
//             icon: IconTag,
//           },
//           {
//             title: 'Orders',
//             url: '/orders',
//             icon: IconShoppingCart,
//           },
//           {
//             title: 'My Store',
//             url: '/store',
//             icon: IconBuildingStore,
//           },
//           {
//             title: 'My Collections',
//             url: '/store/collections',
//             icon: IconFolderOpen,
//           },
//           {
//             title: 'Membership',
//             url: '/store/membership',
//             icon: IconCrown,
//           },
//         ],
//       },
//     ],
//   }
// }

// export const sidebarData = getSidebarData()



import {
  IconLayoutDashboard,
  IconTag,
  IconShoppingCart,
  IconBuildingStore,
  IconFolderOpen,
  IconCrown,
} from '@tabler/icons-react'
import { type SidebarData } from '../types'

export const getSidebarData = (vendorId?: string): SidebarData => {
  return {
    user: {
      name: 'satnaing',
      email: 'satnaingdev@gmail.com',
      avatar: '/avatars/shadcn.jpg',
    },
    navGroups: [
      {
        title: 'General',
        items: [
          {
            title: 'Dashboard',
            url: '/dashboard',
            icon: IconLayoutDashboard,
          },
          {
            title: 'Products',
            url: '/products',
            icon: IconTag,
          },
          {
            title: 'Orders',
            url: '/orders',
            icon: IconShoppingCart,
          },
          {
            // My Store is now collapsible — My Collections lives inside it
            title: 'My Store',
            url: '/store',
            icon: IconBuildingStore,
            items: [
              {
                title: 'My Collections',
                url: '/store/collections',
                icon: IconFolderOpen,
              },
            ],
          },
          {
            title: 'Membership',
            url: '/store/membership',
            icon: IconCrown,
          },
        ],
      },
    ],
  }
}

export const sidebarData = getSidebarData()