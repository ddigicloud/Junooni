import type { SocialSection as SocialSectionType, PublicVendor } from "@/lib/types"

interface Props {
  section: SocialSectionType
  vendor: PublicVendor
  variant?: "light" | "dark"
}

const links = [
  { key: "show_instagram", label: "Instagram", getUrl: (v: PublicVendor) => v.instagram ? `https://instagram.com/${v.instagram}` : null },
  { key: "show_youtube",   label: "YouTube",   getUrl: (v: PublicVendor) => v.youtube   ? `https://youtube.com/${v.youtube}`   : null },
  { key: "show_twitter",   label: "Twitter",   getUrl: (v: PublicVendor) => v.xtwitter  ? `https://twitter.com/${v.xtwitter}`  : null },
  { key: "show_facebook",  label: "Facebook",  getUrl: (v: PublicVendor) => v.facebook  ? `https://facebook.com/${v.facebook}` : null },
]

export default function SocialSection({ section, vendor, variant = "light" }: Props) {
  const isDark = variant === "dark"
  const active = links.filter(l => section[l.key as keyof SocialSectionType] && l.getUrl(vendor))

  if (active.length === 0) return null

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {section.title && (
          <h2 className={`text-2xl font-semibold mb-8 ${isDark ? "text-white" : "text-gray-900"}`}>
            {section.title}
          </h2>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          {active.map(link => (
            <a
              key={link.key}
              href={link.getUrl(vendor) ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-sm font-medium border transition-all hover:scale-105"
              style={{
                borderColor: "var(--brand-primary)",
                color: isDark ? "#fff" : "var(--brand-primary)",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
