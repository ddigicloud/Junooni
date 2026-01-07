// import ProductPage from '@/features/productCatalog/components/ProductPage'
// import { createLazyFileRoute } from '@tanstack/react-router'

// export const Route = createLazyFileRoute(
//   '/_authenticated/productCatalog/category/$slug/$id',
// )({
//   component: ProductPage,
// })

// File: src/routes/_authenticated/productCatalog/category/$.lazy.tsx
// This replaces BOTH $slug/$id.lazy.tsx and index.lazy.tsx

import CategoryPage from '@/features/productCatalog/components/category'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_authenticated/productCatalog/category/$slug/$id',
)({
  component: CategoryPage,
})
