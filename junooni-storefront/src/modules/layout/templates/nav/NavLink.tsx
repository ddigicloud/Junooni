"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Define interfaces for the 3-level menu structure
interface SubmenuItemLevel3 {
  label: string
  href: string
}

interface SubmenuItemLevel2 {
  label: string
  href: string
  submenuItems?: SubmenuItemLevel3[]
}

// The main props type
interface NavLinkProps {
  href: string
  label: string
  submenuItems: SubmenuItemLevel2[]
}

export const NavLink = ({ href, label, submenuItems = [] }: NavLinkProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      {/* Parent Link (Level 1) */}
      <div className="flex items-center gap-1 px-3 py-6 transition-all duration-200 cursor-pointer hover:text-black">
        <LocalizedClientLink
          className="text-[15px] tracking-wide capitalize hover:text-ui-fg-base"
          href={href}
        >
          {label}
        </LocalizedClientLink>
      </div>

      {/* Mega Menu (Shows on hover) */}
      {submenuItems.length > 0 && isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto', maxHeight: '80vh' }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute left-0 z-50 w-full mx-auto bg-white border-t border-gray-200 shadow-sm top-full"
        >
          <div className="grid grid-cols-4 gap-8 p-8 mx-auto max-w-7xl">
            {submenuItems.map((level2Item, level2Index) => (
              <div key={level2Index} className="mb-6">
                {/* Level 2 Category Heading */}
                <LocalizedClientLink
                  href={level2Item.href}
                  className="block mb-3 text-lg font-medium text-gray-800 transition-all duration-200 hover:text-black"
                >
                  {level2Item.label}
                </LocalizedClientLink>

                {/* Level 3 Categories */}
                {level2Item.submenuItems && level2Item.submenuItems.length > 0 && (
                  <ul className="space-y-2">
                    {level2Item.submenuItems.map((level3Item, level3Index) => (
                      <li key={level3Index}>
                        <LocalizedClientLink
                          href={level3Item.href}
                          className="block text-sm text-gray-500 transition-all duration-200 hover:text-black"
                        >
                          {level3Item.label}
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}