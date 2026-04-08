import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

// ─── Types ────────────────────────────────────────────────────────────────────

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  author_name: string | null
  category: string | null
  tags: string[] | null
  published_at: string | null
  read_time_minutes: number | null
}

type Category = {
  id: string
  label: string
  value: string
  sort_order: number
}

// Fixed color palette — cycles through these for any category value
const CATEGORY_COLORS: Record<string, string> = {
  "creator-spotlight": "bg-violet-100 text-violet-700",
  "merch-drop":        "bg-orange-100 text-orange-700",
  "behind-the-brand":  "bg-pink-100 text-pink-700",
  "platform-updates":  "bg-blue-100 text-blue-700",
  "creator-tips":      "bg-green-100 text-green-700",
}

const FALLBACK_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-red-100 text-red-700",
]

function getCategoryColor(value: string, allCategories: Category[]): string {
  if (CATEGORY_COLORS[value]) return CATEGORY_COLORS[value]
  // Assign a stable color based on position in the list
  const idx = allCategories.findIndex((c) => c.value === value)
  return FALLBACK_COLORS[(idx >= 0 ? idx : 0) % FALLBACK_COLORS.length]
}

function getCategoryLabel(value: string, allCategories: Category[]): string {
  return allCategories.find((c) => c.value === value)?.label || value
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BACKEND}/store/blog/categories`, {
      next: { revalidate: 300 }, // cache for 5 min
      headers: { "x-publishable-api-key": PUB_KEY },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.categories || []
  } catch {
    return []
  }
}

async function getPosts(category?: string): Promise<Post[]> {
  const params = new URLSearchParams()
  if (category) params.set("category", category)
  params.set("limit", "20")

  try {
    const res = await fetch(`${BACKEND}/store/blog?${params}`, {
      next: { revalidate: 60 },
      headers: { "x-publishable-api-key": PUB_KEY },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.posts || []
  } catch {
    return []
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Blog | JUNOONI – Creator Merch Stories",
  description:
    "Discover creator stories, merch drop announcements, and behind-the-scenes content from India's creator merchandise marketplace.",
  openGraph: {
    title: "JUNOONI Blog",
    description: "Creator stories, merch drops, and more from JUNOONI.",
    url: "https://junooni.com/blog",
    images: [{ url: "https://junooni.com/og-image.jpg" }],
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const activeCategory = searchParams.category

  // Fetch both in parallel
  const [posts, categories] = await Promise.all([
    getPosts(activeCategory),
    getCategories(),
  ])

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-4 py-16 text-black bg-white">
        <div className="max-w-6xl mx-auto mt-4">
          <h1 className="mb-4 text-4xl font-black leading-none tracking-tight md:text-6xl">
            The Creator Blog
          </h1>
          <p className="max-w-xl text-lg text-gray-400">
            Spotlights, merch drops, platform news, and everything happening in
            India&apos;s creator economy.
          </p>
        </div>
      </section>

      {/* Category filter — only shown if categories exist */}
      {categories.length > 0 && (
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="max-w-6xl px-4 mx-auto overflow-x-auto">
            <div className="flex py-3 gap-x-1 whitespace-nowrap">
              <Link
                href="/blog"
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !activeCategory ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.value}`}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.value
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Posts grid */}
      <div className="max-w-6xl px-4 py-12 mx-auto">
        {posts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="mb-4 text-5xl">✍️</p>
            <p className="text-xl font-semibold text-gray-800">No posts yet</p>
            <p className="mt-2 text-gray-500">Check back soon!</p>
          </div>
        ) : (
          <>
            {posts[0] && (
              <FeaturedPost post={posts[0]} categories={categories} />
            )}
            {posts.length > 1 && (
              <div className="grid grid-cols-1 gap-6 mt-12 sm:grid-cols-2 lg:grid-cols-3">
                {posts.slice(1).map((post) => (
                  <PostCard key={post.id} post={post} categories={categories} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "JUNOONI Blog",
            url: "https://junooni.com/blog",
            description: "Creator stories, merch drops, and platform updates from JUNOONI",
            publisher: { "@type": "Organization", name: "JUNOONI", url: "https://junooni.com" },
            blogPost: posts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              url: `https://junooni.com/blog/${post.slug}`,
              datePublished: post.published_at,
              author: { "@type": "Person", name: post.author_name || "JUNOONI Team" },
            })),
          }),
        }}
      />
    </main>
  )
}

// ─── Featured Post ────────────────────────────────────────────────────────────

function FeaturedPost({ post, categories }: { post: Post; categories: Category[] }) {
  const colorClass = getCategoryColor(post.category || "", categories)
  const label      = getCategoryLabel(post.category || "", categories)

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <div className="grid items-center gap-8 overflow-hidden transition-colors md:grid-cols-2 bg-gray-50 rounded-2xl hover:bg-gray-100">
        <div className="relative aspect-[16/9] md:aspect-square bg-gray-200">
          {post.cover_image ? (
            <Image
              src={post.cover_image} alt={post.title} fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw" priority
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-6xl bg-gradient-to-br from-yellow-100 to-orange-100">
              ✍️
            </div>
          )}
          {post.category && (
            <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full ${colorClass}`}>
              {label}
            </span>
          )}
        </div>
        <div className="px-8 py-8 md:py-0">
          <p className="mb-3 text-xs font-semibold tracking-widest text-yellow-600 uppercase">Featured</p>
          <h2 className="mb-4 text-2xl font-black leading-tight text-gray-900 transition-colors md:text-3xl group-hover:text-yellow-600">
            {post.title}
          </h2>
          {post.excerpt && <p className="mb-6 text-gray-600 line-clamp-3">{post.excerpt}</p>}
          <PostMeta post={post} />
        </div>
      </div>
    </Link>
  )
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, categories }: { post: Post; categories: Category[] }) {
  const colorClass = getCategoryColor(post.category || "", categories)
  const label      = getCategoryLabel(post.category || "", categories)

  return (
    <Link href={`/blog/${post.slug}`} className="flex flex-col group">
      <div className="relative aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden mb-4">
        {post.cover_image ? (
          <Image
            src={post.cover_image} alt={post.title} fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-4xl bg-gradient-to-br from-yellow-50 to-orange-50">
            ✍️
          </div>
        )}
        {post.category && (
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
            {label}
          </span>
        )}
      </div>
      <h3 className="mb-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-yellow-600 line-clamp-2">
        {post.title}
      </h3>
      {post.excerpt && <p className="mb-3 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>}
      <div className="mt-auto">
        <PostMeta post={post} />
      </div>
    </Link>
  )
}

// ─── Post Meta ────────────────────────────────────────────────────────────────

function PostMeta({ post }: { post: Post }) {
  return (
    <div className="flex items-center text-xs text-gray-400 gap-x-3">
      <span className="font-medium text-gray-600">{post.author_name || "JUNOONI Team"}</span>
      {post.published_at && (
        <>
          <span>·</span>
          <span>
            {new Date(post.published_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </>
      )}
      {post.read_time_minutes && (
        <>
          <span>·</span>
          <span>{post.read_time_minutes} min read</span>
        </>
      )}
    </div>
  )
}