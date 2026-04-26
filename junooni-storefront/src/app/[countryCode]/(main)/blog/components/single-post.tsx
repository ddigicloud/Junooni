import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import CopyLinkButton from "./CopyLinkButton"

type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image: string | null
  author_name: string | null
  author_avatar: string | null
  audience: string | null
  category: string | null
  tags: string[] | null
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  read_time_minutes: number | null
}

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function getPost(audience: string, slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${BACKEND}/store/blog/${audience}/${slug}`, {
      next: { revalidate: 60 },
      headers: { "x-publishable-api-key": PUB_KEY },
    })
    if (!res.ok) return null
    return (await res.json()).post || null
  } catch { return null }
}

async function getRelatedPosts(audience: string, excludeSlug: string): Promise<Post[]> {
  try {
    const res = await fetch(`${BACKEND}/store/blog/${audience}?limit=4`, {
      next: { revalidate: 60 },
      headers: { "x-publishable-api-key": PUB_KEY },
    })
    if (!res.ok) return []
    const posts = (await res.json()).posts || []
    return posts.filter((p: Post) => p.slug !== excludeSlug).slice(0, 3)
  } catch { return [] }
}

// This single component handles both /blog/fans/[slug] and /blog/creators/[slug]
// audience is passed as a prop from the parent page

export async function generateSinglePostMetadata(audience: string, slug: string): Promise<Metadata> {
  const post = await getPost(audience, slug)
  if (!post) return { title: "Post Not Found" }

  return {
    title: `${post.seo_title || post.title} | JUNOONI Blog`,
    description: post.seo_description || post.excerpt || "",
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || "",
      url: `https://junooni.com/blog/${audience}/${post.slug}`,
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

export default async function SinglePostPage({
  audience,
  slug,
}: {
  audience: string
  slug: string
}) {
  const post = await getPost(audience, slug)
  if (!post) notFound()

  const related = await getRelatedPosts(audience, slug)

  const accentColor = audience === "fans" ? "text-orange-500" : "text-purple-500"
  const audienceLabel = audience === "fans" ? "For Fans" : "For Creators"
  const audiencePath = `/blog/${audience}`

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-3xl px-4 pt-8 pb-2 mx-auto">
        <nav className="flex items-center text-sm text-gray-400 gap-x-2">
          <Link href="/" className="transition-colors hover:text-gray-700">Home</Link>
          <span>/</span>
          <Link href="/blog" className="transition-colors hover:text-gray-700">Blog</Link>
          <span>/</span>
          <Link href={audiencePath} className={`transition-colors hover:text-gray-700 font-medium ${accentColor}`}>
            {audienceLabel}
          </Link>
        </nav>
      </div>

      <article className="max-w-6xl px-4 py-8 mx-auto">
        {/* Meta */}
        <div className="flex flex-wrap items-center mb-6 gap-x-3 gap-y-2">
          <Link href={audiencePath} className={`text-xs font-bold uppercase tracking-widest ${accentColor}`}>
            {audienceLabel}
          </Link>
          {post.published_at && (
            <span className="text-xs text-gray-400">
              {new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
          {post.read_time_minutes && (
            <><span className="text-gray-300">·</span><span className="text-xs text-gray-400">{post.read_time_minutes} min read</span></>
          )}
        </div>

        {/* Title */}
        <h1 className="mb-6 text-3xl font-black leading-tight text-gray-900 md:text-5xl">{post.title}</h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className={`text-xl text-gray-500 leading-relaxed mb-8 border-l-4 pl-5 ${audience === "fans" ? "border-orange-400" : "border-purple-400"}`}>
            {post.excerpt}
          </p>
        )}

        {/* Author */}
        <div className="flex items-center pb-8 mb-10 border-b border-gray-100 gap-x-3">
          {post.author_avatar ? (
            <Image src={post.author_avatar} alt={post.author_name || "Author"} width={40} height={40} className="rounded-full" />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${audience === "fans" ? "bg-gradient-to-br from-orange-400 to-orange-600" : "bg-gradient-to-br from-purple-400 to-purple-600"}`}>
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
          <div className="relative mb-10 overflow-hidden bg-gray-100 rounded-2xl aspect-video">
            <Image src={post.cover_image} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" priority />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg prose-gray max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md prose-blockquote:text-gray-600 prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-1 prose-code:rounded prose-strong:text-gray-900"
          style={{ "--tw-prose-links": audience === "fans" ? "#f97316" : "#a855f7" } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-8 mt-10 border-t border-gray-100">
            <span className="mr-1 text-sm text-gray-400">Tags:</span>
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">#{tag}</span>
            ))}
          </div>
        )}

        {/* Share */}
        {/* Share */}
       {/* Share */}
        <div className="p-6 mt-10 rounded-2xl bg-gray-50">
          <p className="mb-3 text-sm font-semibold text-gray-700">Share this post</p>
          <div className="flex flex-wrap gap-3">
            {/* X (Twitter) */}
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://junooni.com/blog/${audience}/${post.slug}`)}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center px-4 py-2 text-xs text-white transition-colors bg-black rounded-full gap-x-2 hover:bg-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </a>

            {/* WhatsApp */}
            <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - https://junooni.com/blog/${audience}/${post.slug}`)}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center px-4 py-2 text-xs text-white transition-colors bg-green-500 rounded-full gap-x-2 hover:bg-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>

            {/* Facebook */}
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://junooni.com/blog/${audience}/${post.slug}`)}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center px-4 py-2 text-xs text-white transition-colors bg-blue-600 rounded-full gap-x-2 hover:bg-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>

            {/* Copy Link */}
            <CopyLinkButton url={`https://junooni.com/blog/${audience}/${post.slug}`} />
          </div>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-6xl px-4 py-16 mx-auto border-t border-gray-100">
          <h2 className="mb-8 text-2xl font-black text-gray-900">More {audienceLabel}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rp) => (
              <Link key={rp.id} href={`${audiencePath}/${rp.slug}`} className="flex flex-col group">
                <div className="relative mb-4 overflow-hidden bg-gray-100 rounded-xl aspect-video">
                  {rp.cover_image ? (
                    <Image src={rp.cover_image} alt={rp.title} fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="33vw" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-3xl">✍️</div>
                  )}
                </div>
                <h3 className={`font-bold text-gray-900 transition-colors line-clamp-2 ${audience === "fans" ? "group-hover:text-orange-500" : "group-hover:text-purple-500"}`}>
                  {rp.title}
                </h3>
                {rp.published_at && (
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(rp.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href={audiencePath} className="inline-block px-8 py-3 text-sm font-semibold text-white transition-colors bg-black rounded-full hover:bg-gray-800">
              View all {audienceLabel} posts
            </Link>
          </div>
        </section>
      )}

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.seo_description || post.excerpt || "",
          url: `https://junooni.com/blog/${audience}/${post.slug}`,
          datePublished: post.published_at,
          author: { "@type": "Person", name: post.author_name || "JUNOONI Team" },
          publisher: { "@type": "Organization", name: "JUNOONI", url: "https://junooni.com" },
          image: post.cover_image ? { "@type": "ImageObject", url: post.cover_image } : undefined,
          keywords: post.tags?.join(", "),
        }),
      }} />
    </main>
  )
}