import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  author_name: string | null
  category: string | null
  is_featured: boolean
  published_at: string | null
  read_time_minutes: number | null
}

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function getPosts(): Promise<{ featured: Post | null; posts: Post[] }> {
  try {
    const res = await fetch(`${BACKEND}/store/blog/fans?limit=20`, {
      next: { revalidate: 60 },
      headers: { "x-publishable-api-key": PUB_KEY },
    })
    if (!res.ok) return { featured: null, posts: [] }
    const data = await res.json()
    return {
      featured: data.featured_post || null,
      posts: (data.posts || []).filter((p: Post) => !p.is_featured),
    }
  } catch { return { featured: null, posts: [] } }
}

export const metadata: Metadata = {
  title: "For Fans | JUNOONI Blog",
  description: "Merch spotlights, buying guides, gifting ideas and everything for JUNOONI fans.",
  openGraph: { title: "JUNOONI Blog — For Fans", url: "https://junooni.com/blog/fans" },
}

export default async function FansBlogPage() {
  const { featured, posts } = await getPosts()
  const hasContent = featured || posts.length > 0

  return (
    <main className="min-h-screen bg-white">
      <section className="px-4 py-16 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <Link href="/blog" className="text-sm text-gray-400 hover:text-gray-700">← Back to Blog</Link>
          <div className="mt-4">
            <span className="text-xs font-bold tracking-widest text-orange-500 uppercase">For Fans</span>
            <h1 className="mt-2 text-4xl font-black text-gray-900 md:text-6xl">Merch Stories & Guides</h1>
            <p className="max-w-xl mt-3 text-lg text-gray-400">Creator spotlights, buying guides, gifting ideas, and everything merch.</p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl px-4 py-12 mx-auto">
        {!hasContent ? (
          <div className="py-24 text-center">
            <p className="text-5xl">✍️</p>
            <p className="mt-4 text-xl font-semibold text-gray-800">No posts yet</p>
            <p className="mt-2 text-gray-500">Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link href={`/blog/fans/${featured.slug}`} className="block mb-12 group">
                <div className="grid items-center gap-8 overflow-hidden transition-colors rounded-2xl md:grid-cols-2 bg-orange-50 hover:bg-orange-100">
                  <div className="relative bg-orange-100 md:aspect-square aspect-video">
                    {featured.cover_image ? (
                      <Image src={featured.cover_image} alt={featured.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-6xl">✍️</div>
                    )}
                    <span className="absolute px-3 py-1 text-xs font-bold text-white bg-orange-500 rounded-full top-4 left-4">⭐ Featured</span>
                  </div>
                  <div className="px-8 py-8 md:py-0">
                    <h2 className="text-2xl font-black leading-tight text-gray-900 transition-colors md:text-3xl group-hover:text-orange-500">{featured.title}</h2>
                    {featured.excerpt && <p className="mt-3 text-gray-600 line-clamp-3">{featured.excerpt}</p>}
                    <div className="flex items-center mt-4 text-xs text-gray-400 gap-x-2">
                      <span className="font-medium text-gray-600">{featured.author_name || "JUNOONI Team"}</span>
                      {featured.published_at && <><span>·</span><span>{new Date(featured.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></>}
                      {featured.read_time_minutes && <><span>·</span><span>{featured.read_time_minutes} min</span></>}
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Rest of posts */}
            {posts.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link key={post.id} href={`/blog/fans/${post.slug}`} className="flex flex-col group">
                    <div className="relative mb-4 overflow-hidden bg-gray-100 rounded-xl aspect-video">
                      {post.cover_image ? (
                        <Image src={post.cover_image} alt={post.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="33vw" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-4xl bg-orange-50">✍️</div>
                      )}
                    </div>
                    <h3 className="mb-2 text-base font-bold leading-snug text-gray-900 transition-colors line-clamp-2 group-hover:text-orange-500">{post.title}</h3>
                    {post.excerpt && <p className="mb-3 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>}
                    <div className="flex items-center mt-auto text-xs text-gray-400 gap-x-2">
                      <span className="font-medium text-gray-600">{post.author_name || "JUNOONI Team"}</span>
                      {post.published_at && <><span>·</span><span>{new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></>}
                      {post.read_time_minutes && <><span>·</span><span>{post.read_time_minutes} min</span></>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}