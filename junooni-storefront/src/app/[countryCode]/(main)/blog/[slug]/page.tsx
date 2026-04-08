import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

// ─── Types ────────────────────────────────────────────────────────────────────

type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image: string | null
  author_name: string | null
  author_avatar: string | null
  category: string | null
  tags: string[] | null
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  read_time_minutes: number | null
}

type Category = {
  id: string
  label: string
  value: string
  sort_order: number
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BACKEND}/store/blog/categories`, {
      next: { revalidate: 300 },
      headers: { "x-publishable-api-key": PUB_KEY },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.categories || []
  } catch {
    return []
  }
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${BACKEND}/store/blog/${slug}`, {
      next: { revalidate: 60 },
      headers: { "x-publishable-api-key": PUB_KEY },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.post || null
  } catch {
    return null
  }
}

async function getRelatedPosts(category: string | null, excludeSlug: string): Promise<Post[]> {
  if (!category) return []
  try {
    const res = await fetch(
      `${BACKEND}/store/blog?category=${category}&limit=4`,
      {
        next: { revalidate: 60 },
        headers: { "x-publishable-api-key": PUB_KEY },
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.posts || []).filter((p: Post) => p.slug !== excludeSlug).slice(0, 3)
  } catch {
    return []
  }
}

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const res = await fetch(`${BACKEND}/store/blog?limit=100`, {
      headers: { "x-publishable-api-key": PUB_KEY },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.posts || []).map((p: Post) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: "Post Not Found" }

  return {
    title: `${post.seo_title || post.title} | JUNOONI Blog`,
    description: post.seo_description || post.excerpt || "",
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || "",
      url: `https://junooni.com/blog/${post.slug}`,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
      type: "article",
      publishedTime: post.published_at || undefined,
      authors: [post.author_name || "JUNOONI Team"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || "",
      images: post.cover_image ? [post.cover_image] : [],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  // Fetch all three in parallel
  const [post, categories] = await Promise.all([
    getPost(params.slug),
    getCategories(),
  ])

  if (!post) notFound()

  const related = await getRelatedPosts(post.category, post.slug)

  // Helper to resolve category label from DB
  const getCategoryLabel = (value: string | null) =>
    value
      ? (categories.find((c) => c.value === value)?.label || value)
      : null

  const categoryLabel = getCategoryLabel(post.category)

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-3xl px-4 pt-8 pb-2 mx-auto">
        <nav className="flex items-center text-sm text-gray-400 gap-x-2">
          <Link href="/" className="transition-colors hover:text-gray-700">Home</Link>
          <span>/</span>
          <Link href="/blog" className="transition-colors hover:text-gray-700">Blog</Link>
          {categoryLabel && (
            <>
              <span>/</span>
              <Link
                href={`/blog?category=${post.category}`}
                className="transition-colors hover:text-gray-700"
              >
                {categoryLabel}
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Article */}
      <article className="max-w-3xl px-4 py-8 mx-auto">
        {/* Category + Meta */}
        <div className="flex flex-wrap items-center mb-6 gap-x-3 gap-y-2">
          {categoryLabel && (
            <Link
              href={`/blog?category=${post.category}`}
              className="text-xs font-bold tracking-widest text-yellow-600 uppercase hover:text-yellow-700"
            >
              {categoryLabel}
            </Link>
          )}
          {post.published_at && (
            <span className="text-xs text-gray-400">
              {new Date(post.published_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </span>
          )}
          {post.read_time_minutes && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">{post.read_time_minutes} min read</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="mb-6 text-3xl font-black leading-tight text-gray-900 md:text-5xl">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="pl-5 mb-8 text-xl leading-relaxed text-gray-500 border-l-4 border-yellow-400">
            {post.excerpt}
          </p>
        )}

        {/* Author */}
        <div className="flex items-center pb-8 mb-10 border-b border-gray-100 gap-x-3">
          {post.author_avatar ? (
            <Image
              src={post.author_avatar} alt={post.author_name || "Author"}
              width={40} height={40} className="object-cover rounded-full"
            />
          ) : (
            <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full bg-gradient-to-br from-yellow-400 to-orange-400">
              {(post.author_name || "J")[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">{post.author_name || "JUNOONI Team"}</p>
            <p className="text-xs text-gray-400">JUNOONI</p>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-gray-100">
            <Image
              src={post.cover_image} alt={post.title} fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px" priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg prose-gray max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-a:text-yellow-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md prose-blockquote:border-yellow-400 prose-blockquote:text-gray-600 prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-1 prose-code:rounded prose-strong:text-gray-900 "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-8 mt-10 border-t border-gray-100">
            <span className="mr-1 text-sm text-gray-400">Tags:</span>
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${tag}`}
                className="px-3 py-1 text-xs text-gray-600 transition-colors bg-gray-100 rounded-full hover:bg-gray-200">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="p-6 mt-10 bg-gray-50 rounded-2xl">
          <p className="mb-3 text-sm font-semibold text-gray-700">Share this post</p>
          <div className="flex gap-x-3">
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://junooni.com/blog/${post.slug}`)}`}
              target="_blank" rel="noreferrer"
              className="px-4 py-2 text-xs text-white transition-colors bg-black rounded-full hover:bg-gray-800">
              Share on X
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://junooni.com/blog/${post.slug}`)}`}
              target="_blank" rel="noreferrer"
              className="px-4 py-2 text-xs text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700">
              LinkedIn
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - https://junooni.com/blog/${post.slug}`)}`}
              target="_blank" rel="noreferrer"
              className="px-4 py-2 text-xs text-white transition-colors bg-green-500 rounded-full hover:bg-green-600">
              WhatsApp
            </a>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="max-w-6xl px-4 py-16 mx-auto border-t border-gray-100">
          <h2 className="mb-8 text-2xl font-black text-gray-900">
            More from {categoryLabel || "JUNOONI Blog"}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rp) => (
              <Link key={rp.id} href={`/blog/${rp.slug}`} className="flex flex-col group">
                <div className="relative aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden mb-4">
                  {rp.cover_image ? (
                    <Image src={rp.cover_image} alt={rp.title} fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-3xl bg-gradient-to-br from-yellow-50 to-orange-50">✍️</div>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 transition-colors group-hover:text-yellow-600 line-clamp-2">
                  {rp.title}
                </h3>
                {rp.published_at && (
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(rp.published_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                )}
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/blog"
              className="inline-block px-8 py-3 text-sm font-semibold text-white transition-colors bg-black rounded-full hover:bg-gray-800">
              View all posts
            </Link>
          </div>
        </section>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.seo_description || post.excerpt || "",
            url: `https://junooni.com/blog/${post.slug}`,
            datePublished: post.published_at,
            dateModified: post.published_at,
            author: { "@type": "Person", name: post.author_name || "JUNOONI Team" },
            publisher: {
              "@type": "Organization", name: "JUNOONI", url: "https://junooni.com",
              logo: { "@type": "ImageObject", url: "https://junooni.com/logo.png" },
            },
            image: post.cover_image ? { "@type": "ImageObject", url: post.cover_image } : undefined,
            keywords: post.tags?.join(", "),
          }),
        }}
      />
    </main>
  )
}