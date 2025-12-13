// 'use client'

// import React from 'react'

// import type { Header as HeaderType } from '@/payload-types'

// import { CMSLink } from '@/components/Link'
// import Link from 'next/link'
// import { SearchIcon } from 'lucide-react'

// export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
//   const navItems = data?.navItems || []

//   return (
//     <nav className="flex gap-3 items-center">
//       {navItems.map(({ link }, i) => {
//         return <CMSLink key={i} {...link} appearance="link" />
//       })}
//       <Link href="/search">
//         <span className="sr-only">Search</span>
//         <SearchIcon className="w-5 text-primary" />
//       </Link>
//     </nav>
//   )
// }

'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-2 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <Link 
        href="/search"
        className="flex items-center justify-center w-10 h-10 text-gray-700 transition-colors rounded-lg hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-orange-400"
        aria-label="Search products"
      >
        <SearchIcon className="w-5 h-5" />
      </Link>
    </nav>
  )
}