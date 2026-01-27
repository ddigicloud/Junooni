import { Metadata } from "next"
import ProductCarePage from "./ProductCarePage"

export const metadata: Metadata = {
  title: "Product Care Guide | Junooni Store",
  description:
    "Learn how to care for your Junooni merchandise. Complete guide for washing, drying, ironing, and storing apparel, hoodies, accessories, and printed items. Tips for maintaining quality and extending product lifespan.",
  openGraph: {
    title: "Product Care Guide | Junooni Store",
    description: "Complete care instructions for your creator merchandise - washing, drying, storage tips and stain removal guide",
    type: "website",
    siteName: "Junooni Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Care Guide | Junooni Store",
    description: "Keep your merchandise looking fresh with our comprehensive care guide",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "product care guide",
    "clothing care instructions",
    "how to wash printed shirts",
    "hoodie care tips",
    "apparel maintenance",
    "print on demand care",
    "fabric care guide",
    "stain removal tips",
    "clothing storage tips",
    "merchandise care",
  ],
}

export default function ProductCarePageWrapper() {
  return <ProductCarePage />
}