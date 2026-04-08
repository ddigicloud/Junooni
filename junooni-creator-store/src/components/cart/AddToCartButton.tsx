"use client"

import { useState, useTransition, useEffect, useMemo } from "react"
import { ShoppingCart, Check, Loader2 } from "lucide-react"
import { addToCart } from "@/lib/cart"
import { useCart } from "@/context/CartContext"

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

// inventory_quantity meanings:
//   undefined/null → not fetched, assume orderable (Medusa guards at cart)
//   -1             → no inventory record linked → blocked (Medusa throws "required inventory" error)
//   0              → OOS
//   > 0            → in stock
const getStockStatus = (variant: any): "instock" | "oos" | "blocked" | "unknown" => {
  if (!variant) return "blocked"
  const qty = variant.inventory_quantity
  if (qty === undefined || qty === null) return "unknown"
  if (qty === -1) return "blocked"   // no inventory record
  if (qty === 0)  return "oos"
  return "instock"
}

const isOrderable = (variant: any): boolean => {
  const s = getStockStatus(variant)
  return s === "instock" || s === "unknown"
}

export default function AddToCartButton({ product, brandPrimary = "#e65100", isDark = false }: Props) {
  const { openCart, refreshCart } = useCart()
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [options, setOptions] = useState<Record<string, string | undefined>>({})

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

  const stockStatus = getStockStatus(selectedVariant)
  const isValidVariant = !!selectedVariant?.id
  const canOrder = isValidVariant && isOrderable(selectedVariant)

  // For each option value: what status does selecting it lead to?
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
        await addToCart({ variantId: selectedVariant.id, quantity })
        await refreshCart()
        setAdded(true)
        openCart()
        setTimeout(() => setAdded(false), 2500)
      } catch (e: any) {
        // Catch Medusa inventory errors and show inline
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

  // Button label + color
  const btnLabel = () => {
    if (isPending) return null
    if (added) return "Added to cart!"
    if (!isValidVariant) return "Not Available"
    if (stockStatus === "blocked" || stockStatus === "oos") return "Out of Stock"
    return "Add to Cart"
  }

  const btnBg = () => {
    if (!canOrder && isValidVariant) return "#f59e0b"   // amber = OOS
    if (!isValidVariant) return "#9ca3af"               // grey = no variant
    if (added) return "#16a34a"                         // green = added
    return `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)`
  }

  return (
    <div className="space-y-5">
      {product.options?.map((option: any) => (
        <div key={option.id}>
          <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/60" : "text-gray-500"}`}>
            {option.title}
            {options[option.id] && (
              <span className="ml-2 normal-case font-normal text-gray-400">
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
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 border border-white" />
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
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
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