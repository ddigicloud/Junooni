import {
  IconLayoutDashboard,
  IconTag,
  IconShoppingCart,
  IconBuildingStore,
  IconFolderOpen,
  IconCrown,
  IconEdit,
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
            title: 'My Store',
            url: '/store',
            icon: IconBuildingStore,
            items: [
              {
                title: 'My Collections',
                url: '/store/collections',
                icon: IconFolderOpen,
              },
              {
                title: 'Store Editor',
                url: '/store/editor',
                icon: IconEdit,
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