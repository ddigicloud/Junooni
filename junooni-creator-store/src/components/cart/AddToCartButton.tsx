// "use client"

// import { useState, useTransition, useEffect, useMemo } from "react"
// import { ShoppingCart, Check, Loader2 } from "lucide-react"
// import { addToCart } from "@/lib/cart"
// import { useCart } from "@/context/CartContext"

// interface Props {
//   product: any
//   brandPrimary?: string
//   isDark?: boolean
// }

// const optionsAsKeymap = (variantOptions?: any[]): Record<string, string> => {
//   if (!variantOptions?.length) return {}
//   return variantOptions.reduce((acc: Record<string, string>, vo: any) => {
//     const id = vo.option_id ?? vo.option?.id
//     if (id && vo.value) acc[id] = vo.value
//     return acc
//   }, {})
// }

// const mapsEqual = (a: Record<string, string>, b: Record<string, string | undefined>): boolean => {
//   const aKeys = Object.keys(a)
//   const bKeys = Object.keys(b).filter(k => b[k] !== undefined)
//   if (aKeys.length !== bKeys.length) return false
//   return aKeys.every(k => a[k] === b[k])
// }

// const titleMatchesOptions = (title: string, opts: Record<string, string | undefined>): boolean => {
//   if (!title) return false
//   const parts = title.split(" / ").map(s => s.trim())
//   const vals = Object.values(opts).filter(Boolean) as string[]
//   return vals.length > 0 && vals.every(v => parts.includes(v))
// }

// // inventory_quantity meanings:
// //   undefined/null → not fetched, assume orderable (Medusa guards at cart)
// //   -1             → no inventory record linked → blocked (Medusa throws "required inventory" error)
// //   0              → OOS
// //   > 0            → in stock
// const getStockStatus = (variant: any): "instock" | "oos" | "blocked" | "unknown" => {
//   if (!variant) return "blocked"
//   const qty = variant.inventory_quantity
//   if (qty === undefined || qty === null) return "unknown"
//   if (qty === -1) return "blocked"   // no inventory record
//   if (qty === 0)  return "oos"
//   return "instock"
// }

// const isOrderable = (variant: any): boolean => {
//   const s = getStockStatus(variant)
//   return s === "instock" || s === "unknown"
// }

// export default function AddToCartButton({ product, brandPrimary = "#e65100", isDark = false }: Props) {
//   const { openCart, refreshCart } = useCart()
//   const [isPending, startTransition] = useTransition()
//   const [added, setAdded] = useState(false)
//   const [cartError, setCartError] = useState<string | null>(null)
//   const [quantity, setQuantity] = useState(1)
//   const [options, setOptions] = useState<Record<string, string | undefined>>({})

//   const hasOptionsData = useMemo(
//     () => product.variants?.some((v: any) => v.options?.length > 0),
//     [product.variants]
//   )

//   const findVariant = (opts: Record<string, string | undefined>) => {
//     if (!product.variants?.length) return undefined
//     if (hasOptionsData) {
//       return product.variants.find((v: any) =>
//         mapsEqual(optionsAsKeymap(v.options), opts as Record<string, string>)
//       )
//     }
//     return product.variants.find((v: any) => titleMatchesOptions(v.title ?? "", opts))
//   }

//   // Pre-select first orderable variant on load
//   useEffect(() => {
//     if (!product.variants?.length || !product.options?.length) return

//     const first = product.variants.find((v: any) => isOrderable(v)) ?? product.variants[0]

//     if (hasOptionsData) {
//       setOptions(optionsAsKeymap(first.options))
//     } else {
//       const parts = (first.title ?? "").split(" / ").map((s: string) => s.trim())
//       const init: Record<string, string> = {}
//       product.options?.forEach((opt: any) => {
//         const match = opt.values?.find((val: any) => parts.includes(val.value))
//         if (match) init[opt.id] = match.value
//       })
//       setOptions(init)
//     }
//     setQuantity(1)
//     setCartError(null)
//   }, [product.id, hasOptionsData])

//   const setOptionValue = (optionId: string, value: string) => {
//     setOptions(prev => ({ ...prev, [optionId]: value }))
//     setCartError(null)
//   }

//   const selectedVariant = useMemo(
//     () => findVariant(options),
//     [options, product.variants, hasOptionsData]
//   )

//   const stockStatus = getStockStatus(selectedVariant)
//   const isValidVariant = !!selectedVariant?.id
//   const canOrder = isValidVariant && isOrderable(selectedVariant)

//   // For each option value: what status does selecting it lead to?
//   const getOptionStatus = (optionId: string, value: string): "instock" | "oos" | "blocked" | "unavailable" | "unknown" => {
//     const v = findVariant({ ...options, [optionId]: value })
//     if (!v) return "unavailable"
//     return getStockStatus(v)
//   }

//   const handleAdd = () => {
//     if (!selectedVariant?.id || !canOrder) return
//     setCartError(null)
//     startTransition(async () => {
//       try {
//         await addToCart({ variantId: selectedVariant.id, quantity })
//         await refreshCart()
//         setAdded(true)
//         openCart()
//         setTimeout(() => setAdded(false), 2500)
//       } catch (e: any) {
//         // Catch Medusa inventory errors and show inline
//         const msg = e?.message ?? ""
//         if (msg.includes("inventory") || msg.includes("stock")) {
//           setCartError("This item is currently out of stock")
//         } else {
//           setCartError(msg || "Failed to add to cart")
//         }
//       }
//     })
//   }

//   const borderBase = isDark
//     ? "border-white/20 text-white hover:border-white/60"
//     : "border-gray-200 text-gray-700 hover:border-gray-800"

//   // Button label + color
//   const btnLabel = () => {
//     if (isPending) return null
//     if (added) return "Added to cart!"
//     if (!isValidVariant) return "Not Available"
//     if (stockStatus === "blocked" || stockStatus === "oos") return "Out of Stock"
//     return "Add to Cart"
//   }

//   const btnBg = () => {
//     if (!canOrder && isValidVariant) return "#f59e0b"   // amber = OOS
//     if (!isValidVariant) return "#9ca3af"               // grey = no variant
//     if (added) return "#16a34a"                         // green = added
//     return `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)`
//   }

//   return (
//     <div className="space-y-5">
//       {product.options?.map((option: any) => (
//         <div key={option.id}>
//           <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/60" : "text-gray-500"}`}>
//             {option.title}
//             {options[option.id] && (
//               <span className="ml-2 font-normal text-gray-400 normal-case">
//                 — {options[option.id]}
//               </span>
//             )}
//           </p>
//           <div className="flex flex-wrap gap-2">
//             {option.values?.map((val: any) => {
//               const isSelected = options[option.id] === val.value
//               const status = getOptionStatus(option.id, val.value)
//               const clickable = status !== "unavailable" && status !== "blocked"

//               return (
//                 <button
//                   key={val.id}
//                   onClick={() => clickable && setOptionValue(option.id, val.value)}
//                   disabled={!clickable}
//                   title={
//                     status === "unavailable" || status === "blocked" ? "Not available"
//                     : status === "oos" ? "Out of stock"
//                     : val.value
//                   }
//                   className={`relative px-4 py-2 rounded-full text-sm border-2 font-medium transition-all ${
//                     isSelected
//                       ? "text-white"
//                       : status === "unavailable" || status === "blocked"
//                       ? "border-gray-100 text-gray-300 cursor-not-allowed line-through"
//                       : status === "oos"
//                       ? `${borderBase} opacity-40`
//                       : borderBase
//                   }`}
//                   style={isSelected ? { borderColor: brandPrimary, background: brandPrimary } : {}}
//                 >
//                   {val.value}
//                   {(status === "oos" || status === "blocked") && (
//                     <span className="absolute w-2 h-2 bg-red-400 border border-white rounded-full -top-1 -right-1" />
//                   )}
//                 </button>
//               )
//             })}
//           </div>
//         </div>
//       ))}

//       {/* Status / error messages */}
//       {isValidVariant && !canOrder && (
//         <p className="text-sm text-amber-600 flex items-center gap-1.5">
//           <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0" />
//           {stockStatus === "blocked"
//             ? "This variant is not available for purchase"
//             : "Out of stock — try a different option"
//           }
//         </p>
//       )}
//       {cartError && (
//         <p className="px-3 py-2 text-sm text-red-500 border border-red-100 rounded-lg bg-red-50">
//           {cartError}
//         </p>
//       )}

//       {/* Quantity + CTA */}
//       <div className="flex items-center gap-3">
//         {canOrder && (
//           <div className={`flex items-center rounded-full border-2 ${isDark ? "border-white/20" : "border-gray-200"}`}>
//             <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
//               className={`w-10 h-12 flex items-center justify-center text-lg font-medium transition-colors rounded-l-full ${isDark ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-50"}`}>
//               −
//             </button>
//             <span className={`w-8 text-center text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
//               {quantity}
//             </span>
//             <button onClick={() => setQuantity(q => q + 1)}
//               className={`w-10 h-12 flex items-center justify-center text-lg font-medium transition-colors rounded-r-full ${isDark ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-50"}`}>
//               +
//             </button>
//           </div>
//         )}

//         <button
//           onClick={handleAdd}
//           disabled={isPending || !canOrder}
//           className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-full font-semibold text-base text-white transition-all disabled:cursor-not-allowed"
//           style={{ background: btnBg(), opacity: isPending ? 0.7 : 1 }}
//         >
//           {isPending
//             ? <><Loader2 className="w-5 h-5 animate-spin" />Adding...</>
//             : added
//             ? <><Check className="w-5 h-5" />{btnLabel()}</>
//             : btnLabel() === "Add to Cart"
//             ? <><ShoppingCart className="w-5 h-5" />{btnLabel()}</>
//             : <>{btnLabel()}</>
//           }
//         </button>
//       </div>
//     </div>
//   )
// }

// src/app/[handle]/products/[productHandle]/page.tsx
//
// Changes vs previous version:
//  - Gallery is now a Client Component (ProductGallery) that receives images/activeIndex
//    pushed up from AddToCartButton via onImagesChange callback.
//  - The server shell stays async (generateMetadata + data fetch unchanged).
//  - AddToCartButton receives onImagesChange and calls it on every color change.

"use client"

import { useState, useTransition, useEffect, useMemo } from "react"
import { ShoppingCart, Check, Loader2 } from "lucide-react"
import { addToCart } from "@/lib/cart"
import { useCart } from "@/context/CartContext"
import { useGallery } from "../../app/[handle]/products/GalleryContext"

interface Props {
  product: any
  brandPrimary?: string
  isDark?: boolean
}

const optionsAsKeymap = (variantOptions?: any[]): Record<string, string> => {
  if (!variantOptions?.length) return {}
  return variantOptions.reduce((acc: Record<string, string>, vo: any) => {
    const id = vo.option_id ?? vo.option?.id
    if (id && vo.value) acc[id] = vo.value
    return acc
  }, {})
}

const mapsEqual = (a: Record<string, string>, b: Record<string, string | undefined>): boolean => {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b).filter(k => b[k] !== undefined)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every(k => a[k] === b[k])
}

const titleMatchesOptions = (title: string, opts: Record<string, string | undefined>): boolean => {
  if (!title) return false
  const parts = title.split(" / ").map(s => s.trim())
  const vals = Object.values(opts).filter(Boolean) as string[]
  return vals.length > 0 && vals.every(v => parts.includes(v))
}

const getStockStatus = (variant: any): "instock" | "oos" | "blocked" | "unknown" => {
  if (!variant) return "blocked"
  const qty = variant.inventory_quantity
  if (qty === undefined || qty === null) return "unknown"
  if (qty === -1) return "blocked"
  if (qty === 0)  return "oos"
  return "instock"
}

const isOrderable = (variant: any): boolean => {
  const s = getStockStatus(variant)
  return s === "instock" || s === "unknown"
}

// ─── Gallery helpers ──────────────────────────────────────────────────────────

function safeJson<T>(str: string | undefined, fallback: T): T {
  if (!str) return fallback
  try { return JSON.parse(str) as T } catch { return fallback }
}

/**
 * Get the selected color value from current options state.
 * Looks up which option id corresponds to "Color" using product.options,
 * then reads that id's value from the current selections map.
 */
function getSelectedColorValue(
  productOptions: any[],
  selections: Record<string, string | undefined>
): string | null {
  const colorOpt = productOptions?.find(
    (o: any) => o.title?.toLowerCase() === "color"
  )
  if (!colorOpt) return null
  return selections[colorOpt.id] ?? null
}

/**
 * Return images for the current color selection — 3-level fallback:
 * 1. variant.images[]                  — native Medusa image-variant join
 * 2. variant.metadata.variant_images   — JSON array of URLs
 * 3. Color slug match in product image URLs (e.g. "mockup-front-skyblue.png")
 *
 * colorValue is passed directly from the options state so we don't depend
 * on the nested variant.options[].option.title shape (which may be absent
 * in storefront API responses).
 */
function getImagesForVariant(
  variant: any,
  allProductImages: any[],
  colorValue: string | null
): any[] {
  if (!variant) return []

  // 1. Native Medusa image-variant association
  if (Array.isArray(variant.images) && variant.images.length > 0) {
    return variant.images
  }

  // 2. metadata.variant_images JSON array of URLs
  const metaUrls = safeJson<string[]>(variant.metadata?.variant_images, [])
  if (metaUrls.length > 0 && allProductImages.length > 0) {
    const matched = allProductImages.filter((img: any) => metaUrls.includes(img.url))
    if (matched.length > 0) return matched
  }

  // 3. Color slug match in image URL — using colorValue directly from options state
  if (colorValue && allProductImages.length > 0) {
    const colorSlug = colorValue.toLowerCase().replace(/\s+/g, "_")
    const matched = allProductImages.filter((img: any) =>
      img.url?.toLowerCase().includes(colorSlug)
    )
    if (matched.length > 0) return matched
  }

  return []
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AddToCartButton({ product, brandPrimary = "#e65100", isDark = false }: Props) {
const { openCart, refreshCart, handle } = useCart()
  const gallery = useGallery()
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [options, setOptions] = useState<Record<string, string | undefined>>({})

  const allProductImages: any[] = product.images ?? []

  const hasOptionsData = useMemo(
    () => product.variants?.some((v: any) => v.options?.length > 0),
    [product.variants]
  )

  const findVariant = (opts: Record<string, string | undefined>) => {
    if (!product.variants?.length) return undefined
    if (hasOptionsData) {
      return product.variants.find((v: any) =>
        mapsEqual(optionsAsKeymap(v.options), opts as Record<string, string>)
      )
    }
    return product.variants.find((v: any) => titleMatchesOptions(v.title ?? "", opts))
  }

  // Pre-select first orderable variant on load
  useEffect(() => {
    if (!product.variants?.length || !product.options?.length) return

    const first = product.variants.find((v: any) => isOrderable(v)) ?? product.variants[0]

    if (hasOptionsData) {
      setOptions(optionsAsKeymap(first.options))
    } else {
      const parts = (first.title ?? "").split(" / ").map((s: string) => s.trim())
      const init: Record<string, string> = {}
      product.options?.forEach((opt: any) => {
        const match = opt.values?.find((val: any) => parts.includes(val.value))
        if (match) init[opt.id] = match.value
      })
      setOptions(init)
    }
    setQuantity(1)
    setCartError(null)
  }, [product.id, hasOptionsData])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions(prev => ({ ...prev, [optionId]: value }))
    setCartError(null)
  }

  const selectedVariant = useMemo(
    () => findVariant(options),
    [options, product.variants, hasOptionsData]
  )

  // The currently selected color value (e.g. "SkyBlue", "Lavender")
  const selectedColorValue = useMemo(
    () => getSelectedColorValue(product.options ?? [], options),
    [options, product.options]
  )

  // ── Gallery sync ─────────────────────────────────────────────────────────────
  // Deps: selectedVariant?.id AND selectedColorValue — covers both cases:
  //   • Color change that resolves a new variant  → id changes
  //   • Color change where variant id happens to stay same → colorValue changes
  useEffect(() => {
    const images = getImagesForVariant(selectedVariant, allProductImages, selectedColorValue)
    if (images.length > 0) {
      gallery.setImages(images, 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.id, selectedColorValue])
  // ─────────────────────────────────────────────────────────────────────────────

  const stockStatus = getStockStatus(selectedVariant)
  const isValidVariant = !!selectedVariant?.id
  const canOrder = isValidVariant && isOrderable(selectedVariant)

  const getOptionStatus = (optionId: string, value: string): "instock" | "oos" | "blocked" | "unavailable" | "unknown" => {
    const v = findVariant({ ...options, [optionId]: value })
    if (!v) return "unavailable"
    return getStockStatus(v)
  }

  const handleAdd = () => {
    if (!selectedVariant?.id || !canOrder) return
    setCartError(null)
    startTransition(async () => {
      try {
        await addToCart({ handle, variantId: selectedVariant.id, quantity })
        await refreshCart()
        setAdded(true)
        openCart()
        setTimeout(() => setAdded(false), 2500)
      } catch (e: any) {
        const msg = e?.message ?? ""
        if (msg.includes("inventory") || msg.includes("stock")) {
          setCartError("This item is currently out of stock")
        } else {
          setCartError(msg || "Failed to add to cart")
        }
      }
    })
  }

  const borderBase = isDark
    ? "border-white/20 text-white hover:border-white/60"
    : "border-gray-200 text-gray-700 hover:border-gray-800"

  const btnLabel = () => {
    if (isPending) return null
    if (added) return "Added to cart!"
    if (!isValidVariant) return "Not Available"
    if (stockStatus === "blocked" || stockStatus === "oos") return "Out of Stock"
    return "Add to Cart"
  }

  const btnBg = () => {
    if (!canOrder && isValidVariant) return "#f59e0b"
    if (!isValidVariant) return "#9ca3af"
    if (added) return "#16a34a"
    return `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)`
  }

  return (
    <div className="space-y-5">
      {product.options?.map((option: any) => (
        <div key={option.id}>
          <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/60" : "text-gray-500"}`}>
            {option.title}
            {options[option.id] && (
              <span className="ml-2 font-normal text-gray-400 normal-case">
                — {options[option.id]}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {option.values?.map((val: any) => {
              const isSelected = options[option.id] === val.value
              const status = getOptionStatus(option.id, val.value)
              const clickable = status !== "unavailable" && status !== "blocked"

              return (
                <button
                  key={val.id}
                  onClick={() => clickable && setOptionValue(option.id, val.value)}
                  disabled={!clickable}
                  title={
                    status === "unavailable" || status === "blocked" ? "Not available"
                    : status === "oos" ? "Out of stock"
                    : val.value
                  }
                  className={`relative px-4 py-2 rounded-full text-sm border-2 font-medium transition-all ${
                    isSelected
                      ? "text-white"
                      : status === "unavailable" || status === "blocked"
                      ? "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                      : status === "oos"
                      ? `${borderBase} opacity-40`
                      : borderBase
                  }`}
                  style={isSelected ? { borderColor: brandPrimary, background: brandPrimary } : {}}
                >
                  {val.value}
                  {(status === "oos" || status === "blocked") && (
                    <span className="absolute w-2 h-2 bg-red-400 border border-white rounded-full -top-1 -right-1" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Status / error messages */}
      {isValidVariant && !canOrder && (
        <p className="text-sm text-amber-600 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0" />
          {stockStatus === "blocked"
            ? "This variant is not available for purchase"
            : "Out of stock — try a different option"
          }
        </p>
      )}
      {cartError && (
        <p className="px-3 py-2 text-sm text-red-500 border border-red-100 rounded-lg bg-red-50">
          {cartError}
        </p>
      )}

      {/* Quantity + CTA */}
      <div className="flex items-center gap-3">
        {canOrder && (
          <div className={`flex items-center rounded-full border-2 ${isDark ? "border-white/20" : "border-gray-200"}`}>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className={`w-10 h-12 flex items-center justify-center text-lg font-medium transition-colors rounded-l-full ${isDark ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-50"}`}>
              −
            </button>
            <span className={`w-8 text-center text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {quantity}
            </span>
            <button onClick={() => setQuantity(q => q + 1)}
              className={`w-10 h-12 flex items-center justify-center text-lg font-medium transition-colors rounded-r-full ${isDark ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-50"}`}>
              +
            </button>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={isPending || !canOrder}
          className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-full font-semibold text-base text-white transition-all disabled:cursor-not-allowed"
          style={{ background: btnBg(), opacity: isPending ? 0.7 : 1 }}
        >
          {isPending
            ? <><Loader2 className="w-5 h-5 animate-spin" />Adding...</>
            : added
            ? <><Check className="w-5 h-5" />{btnLabel()}</>
            : btnLabel() === "Add to Cart"
            ? <><ShoppingCart className="w-5 h-5" />{btnLabel()}</>
            : <>{btnLabel()}</>
          }
        </button>
      </div>
    </div>
  )
}