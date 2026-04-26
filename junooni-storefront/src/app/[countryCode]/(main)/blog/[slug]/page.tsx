import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

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
  } catch (err) {
    console.error("[blog][getCategories] error:", err)
    return []
  }
}

async function getPost(slug: string): Promise<Post | null> {
  // console.log("[blog][getPost] slug:", slug)
  // console.log("[blog][getPost] BACKEND:", BACKEND)
  // console.log("[blog][getPost] PUB_KEY present:", !!PUB_KEY)

  try {
    const url = `${BACKEND}/store/blog/${slug}`
    console.log("[blog][getPost] fetching:", url)

    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { "x-publishable-api-key": PUB_KEY },
    })

    console.log("[blog][getPost] status:", res.status)

    if (!res.ok) {
      const errText = await res.text()
      console.error("[blog][getPost] error body:", errText)
      return null
    }

    const data = await res.json()
    console.log("[blog][getPost] data keys:", Object.keys(data))
    console.log("[blog][getPost] post exists:", !!data.post)
    return data.post || null
  } catch (err) {
    console.error("[blog][getPost] threw:", err)
    return null
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  console.log("[blog][page] params received")
  const { slug } = await params
  console.log("[blog][page] slug:", slug)

  let post: Post | null = null
  let categories: Category[] = []

  try {
    console.log("[blog][page] starting parallel fetch")
    ;[post, categories] = await Promise.all([
      getPost(slug),
      getCategories(),
    ])
    console.log("[blog][page] fetch done — post:", !!post, "categories:", categories.length)
  } catch (err) {
    console.error("[blog][page] Promise.all threw:", err)
  }

  if (!post) {
    console.log("[blog][page] post is null, calling notFound()")
    notFound()
  }

  const getCategoryLabel = (value: string | null) =>
    value ? (categories.find((c) => c.value === value)?.label || value) : null

  const categoryLabel = getCategoryLabel(post.category)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl px-4 pt-8 pb-2 mx-auto">
        <nav className="flex items-center text-sm text-gray-400 gap-x-2">
          <Link href="/" className="transition-colors hover:text-gray-700">Home</Link>
          <span>/</span>
          <Link href="/blog" className="transition-colors hover:text-gray-700">Blog</Link>
        </nav>
      </div>

      <article className="max-w-5xl px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-black leading-tight text-gray-900 md:text-5xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="pl-5 mb-8 text-xl leading-relaxed text-gray-500 border-l-4 border-yellow-400">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center pb-8 mb-10 border-b border-gray-100 gap-x-3">
          <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full bg-gradient-to-br from-yellow-400 to-orange-400">
            {(post.author_name || "J")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{post.author_name || "JUNOONI Team"}</p>
          </div>
        </div>

        {/* {post.cover_image && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-gray-100">
            <Image
              src={post.cover_image} alt={post.title} fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px" priority
            />
          </div>
        )} */}

        <div
          className="prose prose-lg prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  )
}