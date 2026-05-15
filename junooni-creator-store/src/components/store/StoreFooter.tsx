import Link from "next/link"
import Image from "next/image"
import type { PublicVendor, VendorStore, CategoryMeta, CollectionMeta } from "@/lib/types"

interface Props {
  vendor: PublicVendor
  store: VendorStore | null
  categories: CategoryMeta[]
  collections: CollectionMeta[]
}

export default function StoreFooter({ vendor, store, categories, collections }: Props) {
  const brandPrimary = store?.primary_color ?? "#e65100"
  const isDark = store?.template === "bold"
  const handle = vendor.handle
  const footerPages = ((store as any)?.pages?.pages ?? []).filter((p: any) => p.in_footer)
  const hasSocial = vendor.instagram || vendor.youtube || vendor.xtwitter || vendor.facebook

  const homeSections: any[] = (store as any)?.sections?.sections ?? []
const footerSection = homeSections.find((s: any) => s.type === "footer")

  // Section color overrides
  const footerBg   = footerSection?.background_color ?? null
  const footerText = footerSection?.text_color ?? null

  // Logo sizes
  const footerLogoDesktop: number = footerSection?.footer_logo_size_desktop ?? 36
  const footerLogoMobile: number  = footerSection?.footer_logo_size_mobile  ?? 28

  // Footer columns — creator-defined or auto-built
  const customColumns: any[] = footerSection?.footer_columns ?? []
  const autoColumns = [
    {
      id: "col_shop",
      heading: "Shop",
      items: [
        { id: "f_products", label: "All Products", url: "/products" },
        ...collections.slice(0, 4).map(c => ({ id: c.id, label: c.title, url: `/collections/${c.handle}` })),
      ],
    },
    ...(categories.length > 0 ? [{
      id: "col_categories",
      heading: "Categories",
      items: categories.slice(0, 5).map(c => ({ id: c.id, label: c.name, url: `/categories/${c.handle}` })),
    }] : []),
    {
      id: "col_info",
      heading: "Info",
      items: footerPages.map((p: any) => ({ id: p.id, label: p.title, url: `/p/${p.slug}` })),
    },
  ]
  const footerColumns = customColumns.length > 0 ? customColumns : autoColumns

  return (
    <footer
      className={`border-t mt-20 ${isDark ? "border-white/10 bg-black text-white" : "border-gray-100 bg-white text-gray-900"}`}
      style={{
        ...(footerBg   ? { backgroundColor: footerBg }   : {}),
        ...(footerText ? { color: footerText }            : {}),
      }}
    >
     <div className={`grid max-w-6xl gap-8 px-6 py-12 mx-auto grid-cols-2 md:grid-cols-${Math.min(footerColumns.length + 2, 6)}`}>

        {/* Brand */}
        {/* <div className="col-span-2 md:col-span-1">
          {(store as any)?.store_logo ? (
            <div className="mb-3">
              <Image
                src={(store as any).store_logo}
                alt={vendor.name}
                width={120}
                height={40}
                className="object-contain w-auto h-9"
                style={isDark ? { filter: "brightness(0) invert(1)" } : {}}
              />
            </div>
          ) : (
            <p className="mb-2 text-base font-bold">{vendor.name}</p>
          )}
          {vendor.creator_bio && (
            <p className={`text-sm leading-relaxed line-clamp-3 ${isDark ? "text-white/50" : "text-gray-500"}`}>
              {vendor.creator_bio}
            </p>
          )}
        </div> */}

        {/* Shop */}
        {/* <div>
          <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Shop</p>
          <div className="space-y-2">
            {footerNavItems.map((item: any) => {
              const href = item.href
                ?? (item.url
                  ? (item.url.startsWith("http")
                    ? item.url
                    : `/${handle}${item.url.startsWith("/") ? item.url : `/${item.url}`}`)
                  : `/${handle}`)
              return (
                <Link
                  key={item.id}
                  href={href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className={`block text-sm ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div> */}

        {/* Categories */}
        {/* {categories.length > 0 && (
          <div>
            <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Categories</p>
            <div className="space-y-2">
              {categories.slice(0, 5).map(c => (
                <Link
                  key={c.id}
                  href={`/${handle}/categories/${c.handle}`}
                  className={`block text-sm ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )} */}

        {/* Info */}
        {/* <div>
          <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Info</p>
          <div className="space-y-2">
            {footerPages.map((p: any) => (
              <Link
                key={p.id}
                href={`/${handle}/p/${p.slug}`}
                className={`block text-sm ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
              >
                {p.title}
              </Link>
            ))}
            {vendor.sell_on_marketplace && (
              <a
                href={`https://junooni.com/${vendor.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-sm ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
              >
                Our JUNOONI Store
              </a>
            )}
          </div>
        </div> */}

        {/* Follow Us */}
        {/* {hasSocial && (
          <div>
            <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Follow Us</p>
            <div className="space-y-2">
              {vendor.instagram && (
                <a
                  href={`https://instagram.com/${vendor.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-sm ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                >
                  Instagram
                </a>
              )}
              {vendor.youtube && (
                <a
                  href={`https://youtube.com/${vendor.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-sm ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                >
                  YouTube
                </a>
              )}
              {vendor.xtwitter && (
                <a
                  href={`https://twitter.com/${vendor.xtwitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-sm ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                >
                  Twitter / X
                </a>
              )}
              {vendor.facebook && (
                <a
                  href={`https://facebook.com/${vendor.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-sm ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                >
                  Facebook
                </a>
              )}
            </div>
          </div>
        )} */}
         <div className="col-span-2 md:col-span-1">
          {(store as any)?.store_logo ? (
          <div className="mb-3">
            <Image
              src={(store as any).store_logo}
              alt={vendor.name}
              width={240}
              height={footerLogoDesktop * 2}
              className="object-contain w-auto hidden md:block"
              style={{
                height: footerLogoDesktop,
                ...(isDark ? { filter: "brightness(0) invert(1)" } : {})
              }}
            />
            <Image
              src={(store as any).store_logo}
              alt={vendor.name}
              width={160}
              height={footerLogoMobile * 2}
              className="object-contain w-auto md:hidden"
              style={{
                height: footerLogoMobile,
                ...(isDark ? { filter: "brightness(0) invert(1)" } : {})
              }}
            />
          </div>
        ) : (
          <p className="mb-2 font-bold"
            style={{
              fontSize: footerLogoDesktop * 0.38,
              ...(footerText ? { color: footerText } : {})
            }}>
            {vendor.name}
          </p>
        )}
        {vendor.creator_bio && (
           <p
            className={`text-sm leading-relaxed line-clamp-3 ${isDark ? "text-white/50" : "text-gray-500"}`}
            style={footerText ? { color: footerText, opacity: 0.7 } : {}}
          >
            {vendor.creator_bio}
          </p>
        )}
      </div>

      {/* Dynamic columns */}
      {footerColumns.map((col: any) => (
        <div key={col.id}>
           <p
            className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}
            style={footerText ? { color: footerText, opacity: 0.6 } : {}}
          >
            {col.heading}
          </p>
          <div className="space-y-2">
            {(col.items ?? []).map((item: any) => {
              const href = item.url?.startsWith("http")
                ? item.url
                : `/${handle}${item.url?.startsWith("/") ? item.url : `/${item.url ?? ""}`}`
              return (
                <Link key={item.id} href={href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                   className={`block text-sm transition-colors ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                  style={footerText ? { color: footerText, opacity: 0.8 } : {}}>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      {/* Follow Us — always last */}
      {hasSocial && (
        <div>
          <p
            className={`text-xs uppercase tracking-widest font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}
            style={footerText ? { color: footerText, opacity: 0.6 } : {}}
          >Follow Us</p>
          <div className="space-y-2">
            {vendor.instagram && (
              <a href={`https://instagram.com/${vendor.instagram}`} target="_blank" rel="noopener noreferrer"
                 className={`block text-sm transition-colors ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                  style={footerText ? { color: footerText, opacity: 0.8 } : {}}>
                Instagram
              </a>
            )}
            {vendor.youtube && (
              <a href={`https://youtube.com/${vendor.youtube}`} target="_blank" rel="noopener noreferrer"
                 className={`block text-sm transition-colors ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                  style={footerText ? { color: footerText, opacity: 0.8 } : {}}>
                YouTube
              </a>
            )}
            {vendor.xtwitter && (
              <a href={`https://twitter.com/${vendor.xtwitter}`} target="_blank" rel="noopener noreferrer"
                 className={`block text-sm transition-colors ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                  style={footerText ? { color: footerText, opacity: 0.8 } : {}}>
                Twitter / X
              </a>
            )}
            {vendor.facebook && (
              <a href={`https://facebook.com/${vendor.facebook}`} target="_blank" rel="noopener noreferrer"
                 className={`block text-sm transition-colors ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                  style={footerText ? { color: footerText, opacity: 0.8 } : {}}>
                Facebook
              </a>
            )}
          </div>
        </div>
      )}

      </div>

      {/* Bottom bar */}
       <div
        className={`border-t ${isDark ? "border-white/10" : "border-gray-100"} px-6 py-5`}
        style={footerBg ? { borderColor: footerText ? `${footerText}20` : undefined } : {}}
      >
        <div className="flex flex-col items-center justify-between max-w-6xl gap-3 mx-auto text-xs sm:flex-row">
          <p
            className={isDark ? "text-white/30" : "text-gray-400"}
            style={footerText ? { color: footerText, opacity: 0.5 } : {}}
          >
            © {new Date().getFullYear()} {vendor.name}. All rights reserved.
          </p>
          <p className={isDark ? "text-white/30" : "text-gray-400"}>
            Powered by{" "}
            <a
              href="https://studio.junooni.com"
              style={{ color: brandPrimary }}
              className="font-medium transition-opacity hover:opacity-70"
            >
              JUNOONI
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}