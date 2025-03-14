import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Product } from '../data/schema'

type ProductsDialogType = 'create' | 'update' | 'delete' | 'import'

interface ProductsContextType {
  open: ProductsDialogType | null
  setOpen: (dialog: ProductsDialogType | null) => void
  currentProduct: Product | null
  setCurrentProduct: React.Dispatch<React.SetStateAction<Product | null>>
}

const ProductsContext = React.createContext<ProductsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ProductsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ProductsDialogType>(null)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)

  return (
    <ProductsContext.Provider value={{ open, setOpen, currentProduct, setCurrentProduct }}>
      {children}
    </ProductsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const productsContext = React.useContext(ProductsContext)

  if (!productsContext) {
    throw new Error('useProducts must be used within <ProductsProvider>')
  }

  return productsContext
}
