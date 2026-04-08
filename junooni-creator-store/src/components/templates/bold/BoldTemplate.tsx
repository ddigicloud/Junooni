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

export default function BoldTemplate({ vendor, store, products }: Props) {
  const sections = store?.sections?.sections ?? defaultSections(vendor)
  const fontClass = store?.font === "poppins" ? "font-poppins" : store?.font === "playfair" ? "font-playfair" : "font-inter"

  return (
    <div className={`min-h-screen bg-black text-white ${fontClass}`}>
      {sections.filter(s => s.type === "announcement").map((s, i) => (
        <AnnouncementBar key={i} section={s as any} />
      ))}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/${vendor.handle}`} className="flex items-center gap-3">
            {vendor.logo && (
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20">
                <Image src={vendor.logo} alt={vendor.name} width={32} height={32} className="object-cover" />
              </div>
            )}
            <span className="font-bold text-white tracking-wide text-sm uppercase">{vendor.name}</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href={`/${vendor.handle}#products`} className="text-sm text-white/60 hover:text-white transition-colors uppercase tracking-wider text-xs">Shop</Link>
            <Link href={`/${vendor.handle}#about`} className="text-sm text-white/60 hover:text-white transition-colors uppercase tracking-wider text-xs">About</Link>
            <a
              href={`https://junooni.com/store/${vendor.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-full font-semibold transition-opacity hover:opacity-80 uppercase tracking-wider"
              style={{ background: "var(--brand-primary)", color: "#fff" }}
            >
              Junooni
            </a>
          </nav>
        </div>
      </header>

      {sections.map((section, i) => (
        <BoldSection key={i} section={section} vendor={vendor} products={products} store={store} />
      ))}

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <p>© {new Date().getFullYear()} {vendor.name}</p>
          <p>
            Powered by{" "}
            <a href="https://junooni.com" className="hover:text-white/60 transition-colors" style={{ color: "var(--brand-primary)" }}>
              Junooni
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

function BoldSection({
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
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background — cover photo or hero image with overlay */}
        {(section.background_image ?? vendor.coverphoto) && (
          <>
            <Image
              src={section.background_image ?? vendor.coverphoto!}
              alt="Hero"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
        {/* Background gradient fallback */}
        {!section.background_image && !vendor.coverphoto && (
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, var(--brand-primary)33, transparent 60%), radial-gradient(ellipse at 70% 50%, var(--brand-secondary)22, transparent 60%)` }} />
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] mb-6" style={{ color: "var(--brand-primary)" }}>
              Official Merch
            </p>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-none tracking-tight">
              {section.headline ?? vendor.name}
            </h1>
            {(section.subtext ?? store?.tagline) && (
              <p className="text-xl text-white/70 mb-10 max-w-lg">
                {section.subtext ?? store?.tagline}
              </p>
            )}
            {section.cta_label && (
              <Link
                href={section.cta_url ?? `/${vendor.handle}#products`}
                className="inline-block px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105"
                style={{ background: "var(--brand-primary)", color: "#fff" }}
              >
                {section.cta_label}
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    )

    case "featured": {
      const featured = section.product_ids?.length
        ? products.filter(p => section.product_ids.includes(p.id))
        : products.slice(0, 4)
      return (
        <section id="products" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            {section.title && (
              <h2 className="text-4xl font-black text-white mb-12 uppercase tracking-tight">{section.title}</h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p.id} product={p} handle={vendor.handle} variant="dark" />)}
            </div>
          </div>
        </section>
      )
    }

    case "collection": {
      const limited = products.slice(0, section.limit ?? 12)
      return (
        <section id="products" className="py-20 px-6 bg-white/5">
          <div className="max-w-6xl mx-auto">
            {section.title && (
              <h2 className="text-4xl font-black text-white mb-12 uppercase tracking-tight">{section.title}</h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {limited.map(p => <ProductCard key={p.id} product={p} handle={vendor.handle} variant="dark" />)}
            </div>
          </div>
        </section>
      )
    }

    case "about": return (
      <section id="about" className="py-20 px-6 bg-white/5">
        <div className={`max-w-6xl mx-auto flex flex-col ${section.image_position === "right" ? "md:flex-row-reverse" : "md:flex-row"} gap-12 items-center`}>
          {(section.image ?? vendor.coverphoto) && (
            <div className="w-full md:w-1/2 aspect-square rounded-3xl overflow-hidden relative">
              <Image src={section.image ?? vendor.coverphoto!} alt={vendor.name} fill className="object-cover" />
            </div>
          )}
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl font-black text-white mb-6 uppercase">{section.title ?? "About"}</h2>
            <p className="text-white/70 leading-relaxed text-lg">{section.text ?? vendor.creator_bio}</p>
          </div>
        </div>
      </section>
    )

    case "social": return <SocialSection section={section} vendor={vendor} variant="dark" />

    case "divider": return <div className="border-t border-white/10 mx-6" />

    default: return null
  }
}

function defaultSections(vendor: PublicVendor): StoreSection[] {
  return [
    { type: "hero", headline: vendor.name, subtext: vendor.creator_title ?? undefined, cta_label: "Shop the Drop", cta_url: `/${vendor.handle}#products` },
    { type: "collection", title: "The Collection", limit: 12 },
    ...(vendor.creator_bio ? [{ type: "about" as const, title: "The Artist" }] : []),
    { type: "social", show_instagram: true, show_youtube: true, show_twitter: true },
  ]
}
