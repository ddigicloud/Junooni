import { getStorefrontData } from "@/lib/api"
import { CartProvider } from "@/context/CartContext"
import CartDrawer from "@/components/cart/CartDrawer"
import { notFound } from "next/navigation"

export default async function HandleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { handle: string }
}) {
  const data = await getStorefrontData(params.handle)
  if (!data) notFound()

  const brandPrimary = data.store?.primary_color ?? "#e65100"

  return (
    <CartProvider>
      {children}
      <CartDrawer handle={params.handle} brandPrimary={brandPrimary} />
    </CartProvider>
  )
}
