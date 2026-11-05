"use client"
import { createContext, useContext, useState } from "react"

type Ctx = {
  filterContent: React.ReactNode
  setFilterContent: (c: React.ReactNode) => void
  isOpen: boolean
  openFilter: () => void
  closeFilter: () => void
}

const MobileFilterContext = createContext<Ctx | null>(null)

export function MobileFilterProvider({ children }: { children: React.ReactNode }) {
  const [filterContent, setFilterContent] = useState<React.ReactNode>(null)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <MobileFilterContext.Provider value={{
      filterContent, setFilterContent,
      isOpen,
      openFilter: () => setIsOpen(true),
      closeFilter: () => setIsOpen(false),
    }}>
      {children}
    </MobileFilterContext.Provider>
  )
}

export const useMobileFilter = () => {
  const ctx = useContext(MobileFilterContext)
  if (!ctx) throw new Error("useMobileFilter outside provider")
  return ctx
}