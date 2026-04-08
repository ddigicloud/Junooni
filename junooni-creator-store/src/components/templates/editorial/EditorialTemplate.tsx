"use client"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import type { PublicVendor, VendorStore, Product, StoreSection } from "@/lib/types"
import ProductCard from "@/components/ui/ProductCard"
import AnnouncementBar from "@/components/sections/AnnouncementBar"
import SocialSection from "@/components/sections/SocialSection"

interface Props {
  vendor: PublicVendor
  store: VendorStore | null
  products: Product[]
}

export default function EditorialTemplate({ vendor, store, products }: Props) {
  const sections = store?.sections?.sections ?? defaultSections(vendor)
  const fontClass = store?.font === "playfair" ? "font-playfair" : store?.font === "poppins" ? "font-poppins" : "font-inter"

  return (
    <div className={`min-h-screen bg-[#fafaf8] ${fontClass}`}>
      {sections.filter(s => s.type === "announcement").map((s, i) => (
        <AnnouncementBar key={i} section={s as any} />
      ))}

      {/* Editorial header — big masthead style */}
      <header className="border-b border-gray-200">
        {/* Top bar */}
        <div className="border-b border-gray-200 py-2 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-gray-400 uppercase tracking-widest">
            <span>{vendor.creator_category ?? "Creator"}</span>
            <a
              href={`https://junooni.com/store/${vendor.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 transition-colors"
            >
              View on Junooni ↗
            </a>
          </div>
        </div>
        {/* Masthead */}
        <div className="py-8 px-6 text-center">
          <div className="max-w-6xl mx-auto">
            {vendor.logo && (
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gray-200">
                <Image src={vendor.logo} alt={vendor.name} width={64} height={64} className="object-cover" />
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-playfair)" }}>
              {vendor.name}
            </h1>
            {(store?.tagline ?? vendor.creator_title) && (
              <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest">
                {store?.tagline ?? vendor.creator_title}
              </p>
            )}
          </div>
        </div>
        {/* Nav */}
        <div className="border-t border-gray-200 py-3 px-6">
          <nav className="max-w-6xl mx-auto flex items-center justify-center gap-8">
            {[
              { label: "Shop",  href: `/${vendor.handle}#products` },
              { label: "About", href: `/${vendor.handle}#about` },
              { label: "Social",href: `/${vendor.handle}#social` },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {sections.map((section, i) => (
        <EditorialSection key={i} section={section} vendor={vendor} products={products} store={store} />
      ))}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 px-6 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{vendor.name}</p>
          <p className="text-xs text-gray-300">
            © {new Date().getFullYear()} · Powered by{" "}
            <a href="https://junooni.com" style={{ color: "var(--brand-primary)" }} className="hover:opacity-70 transition-opacity">
              Junooni
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

function EditorialSection({
  section, vendor, products, store
}: {
  section: StoreSection
  vendor: PublicVendor
  products: Product[]
  store: VendorStore | null
}) {
  switch (section.type) {
    case "announcement": return null

    case "hero": return (
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Editorial label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8" style={{ background: "var(--brand-primary)" }} />
                <span className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: "var(--brand-primary)" }}>
                  Official Collection
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
                {section.headline ?? vendor.name}
              </h2>
              {(section.subtext ?? store?.tagline) && (
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {section.subtext ?? store?.tagline}
                </p>
              )}
              {section.cta_label && (
                <Link
                  href={section.cta_url ?? `/${vendor.handle}#products`}
                  className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest border-b-2 pb-1 transition-opacity hover:opacity-70"
                  style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}
                >
                  {section.cta_label}
                  <span>→</span>
                </Link>
              )}
            </motion.div>

            {/* Hero image — editorial half-page style */}
            {(section.background_image ?? vendor.coverphoto) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="aspect-[3/4] relative rounded-2xl overflow-hidden"
              >
                <Image
                  src={section.background_image ?? vendor.coverphoto!}
                  alt={vendor.name}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            )}
          </div>
        </div>
      </section>
    )

    case "featured": {
      const featured = section.product_ids?.length
        ? products.filter(p => section.product_ids.includes(p.id))
        : products.slice(0, 3)

      // Editorial featured: first product is large, rest are smaller
      const [first, ...rest] = featured
      return (
        <section id="products" className="py-16 px-6 border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            {section.title && (
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-xs uppercase tracking-[0.3em] font-semibold text-gray-500">{section.title}</h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            {first && (
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Large featured card */}
                <ProductCard product={first} handle={vendor.handle} />
                {/* Stack of smaller ones */}
                <div className="grid grid-cols-2 gap-4">
                  {rest.slice(0, 4).map(p => (
                    <ProductCard key={p.id} product={p} handle={vendor.handle} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )
    }

    case "collection": {
      const limited = products.slice(0, section.limit ?? 12)
      return (
        <section id="products" className="py-16 px-6 border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            {section.title && (
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-xs uppercase tracking-[0.3em] font-semibold text-gray-500">{section.title}</h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {limited.map(p => <ProductCard key={p.id} product={p} handle={vendor.handle} />)}
            </div>
          </div>
        </section>
      )
    }

    case "about": return (
      <section id="about" className="py-16 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6" style={{ background: "var(--brand-primary)" }} />
              <span className="text-xs uppercase tracking-[0.3em] font-semibold text-gray-400">
                {section.title ?? "About"}
              </span>
            </div>
            {(section.image ?? vendor.logo) && (
              <div className="aspect-square relative rounded-xl overflow-hidden mt-6">
                <Image src={section.image ?? vendor.logo!} alt={vendor.name} fill className="object-cover" />
              </div>
            )}
          </div>
          <div className="md:col-span-2 flex flex-col justify-center">
            <p className="text-gray-700 text-lg leading-relaxed" style={{ fontFamily: "var(--font-playfair)" }}>
              {section.text ?? vendor.creator_bio}
            </p>
            {vendor.creator_title && (
              <p className="mt-6 text-sm text-gray-400 uppercase tracking-widest">{vendor.creator_title}</p>
            )}
          </div>
        </div>
      </section>
    )

    case "social": return (
      <div id="social">
        <SocialSection section={section} vendor={vendor} />
      </div>
    )

    case "divider": return <div className="border-t border-gray-100 mx-6 my-4" />

    default: return null
  }
}

function defaultSections(vendor: PublicVendor): StoreSection[] {
  return [
    { type: "hero", headline: vendor.name, subtext: vendor.creator_title ?? undefined, cta_label: "Shop the Collection", cta_url: `/${vendor.handle}#products` },
    { type: "collection", title: "The Collection", limit: 12 },
    ...(vendor.creator_bio ? [{ type: "about" as const, title: "The Creator" }] : []),
    { type: "social", show_instagram: true, show_youtube: true, show_twitter: true },
  ]
}
