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
//   IconCrown, // ← NEW
// } from '@tabler/icons-react'
// import { type SidebarData } from '../types'

// export const sidebarData: SidebarData = {
//   user: {
//     name: 'satnaing',
//     email: 'satnaingdev@gmail.com',
//     avatar: '/avatars/shadcn.jpg',
//   },
//   navGroups: [
//     {
//       title: 'General',
//       items: [
//         {
//           title: 'Dashboard',
//           url: '/dashboard',
//           icon: IconLayoutDashboard,
//         },
//         {
//           title: 'Products',
//           url: '/products',
//           icon: IconTag,
//         },
//         {
//           title: 'Orders',
//           url: '/orders',
//           icon: IconShoppingCart,
//         },
//         // ── NEW ──────────────────────────────────────────────────────────────
//         {
//           title: 'My Store',
//           url: '/store',
//           icon: IconBuildingStore,
//         },
//          {
//           title: 'My Collections',
//           url: '/store/collections',
//           icon: IconFolderOpen ,
//         },
//          {
//           title: 'Membership',
//           url: '/store/membership',
//           icon: IconCrown ,
//         },
//         // ─────────────────────────────────────────────────────────────────────
//       ],
//     },
//   ],
// }

import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconMessages,
  IconNotification,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
  IconTag,
  IconShoppingCart,
  IconBuildingStore,
  IconFolderOpen,
  IconCrown,
} from '@tabler/icons-react'
import { type SidebarData } from '../types'

const JUNOONI_ADMIN_VENDOR_ID = '01K4QZBPTTDMRYBME8S15Y576G'

export const getSidebarData = (vendorId?: string): SidebarData => {
  const isJunooniAdmin = vendorId === JUNOONI_ADMIN_VENDOR_ID

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
          ...(isJunooniAdmin
            ? [
                {
                  title: 'My Store',
                  url: '/store',
                  icon: IconBuildingStore,
                },
                {
                  title: 'My Collections',
                  url: '/store/collections',
                  icon: IconFolderOpen,
                },
                {
                  title: 'Membership',
                  url: '/store/membership',
                  icon: IconCrown,
                },
              ]
            : []),
        ],
      },
    ],
  }
}

// Backward-compatible default export — used anywhere sidebarData is imported without args
export const sidebarData = getSidebarData()