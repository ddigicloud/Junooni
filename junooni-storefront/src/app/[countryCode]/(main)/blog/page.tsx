// import { Metadata } from "next"
// import Link from "next/link"
// import Image from "next/image"

// type Post = {
//   id: string
//   title: string
//   slug: string
//   excerpt: string | null
//   cover_image: string | null
//   author_name: string | null
//   audience: string | null
//   category: string | null
//   published_at: string | null
//   read_time_minutes: number | null
// }

// const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
// const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

// async function getFansPosts(): Promise<Post[]> {
//   try {
//     const res = await fetch(`${BACKEND}/store/blog/fans?limit=3`, {
//       next: { revalidate: 60 },
//       headers: { "x-publishable-api-key": PUB_KEY },
//     })
//     if (!res.ok) return []
//     return (await res.json()).posts || []
//   } catch { return [] }
// }

// async function getCreatorsPosts(): Promise<Post[]> {
//   try {
//     const res = await fetch(`${BACKEND}/store/blog/creators?limit=3`, {
//       next: { revalidate: 60 },
//       headers: { "x-publishable-api-key": PUB_KEY },
//     })
//     if (!res.ok) return []
//     return (await res.json()).posts || []
//   } catch { return [] }
// }

// export const metadata: Metadata = {
//   title: "Blog | JUNOONI",
//   description: "Stories, guides and updates from India's creator merchandise marketplace.",
//   openGraph: {
//     title: "JUNOONI Blog",
//     description: "For fans and creators — discover merch stories, buying guides, and creator tips.",
//     url: "https://junooni.com/blog",
//   },
// }

// export default async function BlogLandingPage() {
//   const [fansPosts, creatorsPosts] = await Promise.all([getFansPosts(), getCreatorsPosts()])

//   return (
//     <main className="min-h-screen bg-white">
//       {/* Hero */}
//       <section className="px-4 py-16 bg-white">
//         <div className="max-w-6xl mx-auto">
//           <h1 className="mb-3 text-5xl font-black leading-none tracking-tight text-gray-900 md:text-7xl">
//             The JUNOONI Blog
//           </h1>
//           <p className="max-w-2xl text-xl text-gray-400">
//             Stories, guides, and updates from India's creator merchandise marketplace.
//           </p>
//         </div>
//       </section>

//       {/* Two sections */}
//       <div className="max-w-6xl px-4 pb-20 mx-auto space-y-20">

//         {/* ── For Fans ── */}
//         <section>
//           <div className="flex items-end justify-between mb-8">
//             <div>
//               <span className="text-xs font-bold tracking-widest text-orange-500 uppercase">For Fans</span>
//               <h2 className="mt-1 text-3xl font-black text-gray-900">Merch Stories & Guides</h2>
//               <p className="mt-1 text-gray-400">Spotlights, buying guides, gifting ideas and more.</p>
//             </div>
//             <Link href="/blog/fans"
//               className="hidden text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-orange-500 sm:block">
//               View all →
//             </Link>
//           </div>

//           {fansPosts.length === 0 ? (
//             <div className="py-16 text-center rounded-2xl bg-gray-50">
//               <p className="text-gray-400">No posts yet — check back soon!</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//               {fansPosts.map((post) => <PostCard key={post.id} post={post} basePath="/blog/fans" accentColor="orange" />)}
//             </div>
//           )}

//           <div className="mt-6 sm:hidden">
//             <Link href="/blog/fans" className="block w-full py-3 text-sm font-semibold text-center text-white bg-black rounded-full hover:bg-gray-800">
//               View all fan posts →
//             </Link>
//           </div>
//         </section>

//         {/* Divider */}
//         <div className="border-t border-gray-100" />

//         {/* ── For Creators ── */}
//         <section>
//           <div className="flex items-end justify-between mb-8">
//             <div>
//               <span className="text-xs font-bold tracking-widest text-purple-500 uppercase">For Creators</span>
//               <h2 className="mt-1 text-3xl font-black text-gray-900">Launch, Grow & Earn</h2>
//               <p className="mt-1 text-gray-400">Guides, strategies and success stories for creators.</p>
//             </div>
//             <Link href="/blog/creators"
//               className="hidden text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-purple-500 sm:block">
//               View all →
//             </Link>
//           </div>

//           {creatorsPosts.length === 0 ? (
//             <div className="py-16 text-center rounded-2xl bg-gray-50">
//               <p className="text-gray-400">No posts yet — check back soon!</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//               {creatorsPosts.map((post) => <PostCard key={post.id} post={post} basePath="/blog/creators" accentColor="purple" />)}
//             </div>
//           )}

//           <div className="mt-6 sm:hidden">
//             <Link href="/blog/creators" className="block w-full py-3 text-sm font-semibold text-center text-white bg-black rounded-full hover:bg-gray-800">
//               View all creator posts →
//             </Link>
//           </div>
//         </section>
//       </div>
//     </main>
//   )
// }

// function PostCard({ post, basePath, accentColor }: {
//   post: Post
//   basePath: string
//   accentColor: "orange" | "purple"
// }) {
//   const accent = accentColor === "orange"
//     ? "group-hover:text-orange-500"
//     : "group-hover:text-purple-500"

//   return (
//     <Link href={`${basePath}/${post.slug}`} className="flex flex-col group">
//       <div className="relative mb-4 overflow-hidden bg-gray-100 rounded-xl aspect-video">
//         {post.cover_image ? (
//           <Image src={post.cover_image} alt={post.title} fill
//             className="object-cover transition-transform duration-300 group-hover:scale-105"
//             sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
//         ) : (
//           <div className="flex items-center justify-center w-full h-full text-4xl bg-gradient-to-br from-gray-50 to-gray-100">
//             ✍️
//           </div>
//         )}
//       </div>
//       <h3 className={`mb-2 text-base font-bold leading-snug text-gray-900 transition-colors line-clamp-2 ${accent}`}>
//         {post.title}
//       </h3>
//       {post.excerpt && <p className="mb-3 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>}
//       <div className="flex items-center mt-auto text-xs text-gray-400 gap-x-2">
//         <span className="font-medium text-gray-600">{post.author_name || "JUNOONI Team"}</span>
//         {post.published_at && (
//           <>
//             <span>·</span>
//             <span>{new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
//           </>
//         )}
//         {post.read_time_minutes && <><span>·</span><span>{post.read_time_minutes} min</span></>}
//       </div>
//     </Link>
//   )
// }




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
  audience: string | null
  category: string | null
  published_at: string | null
  read_time_minutes: number | null
  is_featured?: boolean
}

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function getAllFansPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${BACKEND}/store/blog/fans?limit=100`, {
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

async function getAllCreatorsPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${BACKEND}/store/blog/creators?limit=100`, {
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

export const metadata: Metadata = {
  title: "Blog | JUNOONI",
  description: "Stories, guides and updates from India's creator merchandise marketplace.",
  openGraph: {
    title: "JUNOONI Blog",
    description: "For fans and creators — discover merch stories, buying guides, and creator tips.",
    url: "https://junooni.com/blog",
  },
}

export default async function BlogLandingPage() {
  const [allFansPosts, allCreatorsPosts] = await Promise.all([
    getAllFansPosts(),
    getAllCreatorsPosts(),
  ])

  const fansPosts = allFansPosts.slice(0, 3)
  const creatorsPosts = allCreatorsPosts.slice(0, 3)

  const featuredRaw = [...allFansPosts, ...allCreatorsPosts].filter((post) => post.is_featured)

  const featuredPosts: { post: Post; basePath: string; accentColor: "orange" | "purple" }[] =
    featuredRaw.map((post) => {
      const isCreator = post.audience === "creators"
      return {
        post,
        basePath: isCreator ? "/blog/creators" : "/blog/fans",
        accentColor: isCreator ? "purple" : "orange",
      }
    })

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="mb-3 text-5xl font-black leading-none tracking-tight text-gray-900 md:text-7xl">
            The JUNOONI Blog
          </h1>
          <p className="max-w-2xl text-xl text-gray-400">
            Stories, guides, and updates from India's creator merchandise marketplace.
          </p>
        </div>
      </section>

      <div className="max-w-6xl px-4 pb-20 mx-auto space-y-20">

        {/* ── Featured Posts ── */}
        {featuredPosts.length > 0 && (
          <section>
            <div className="mb-8">
              <span className="text-xs font-bold tracking-widest text-gray-900 uppercase">Featured</span>
              <h2 className="mt-1 text-3xl font-black text-gray-900">Don't Miss These</h2>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap">
              {featuredPosts.map(({ post, basePath, accentColor }) => (
                <FeaturedPostCard
                  key={post.id}
                  post={post}
                  basePath={basePath}
                  accentColor={accentColor}
                />
              ))}
            </div>
          </section>
        )}

        {featuredPosts.length > 0 && <div className="border-t border-gray-100" />}

        {/* ── For Fans ── */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-orange-500 uppercase">For Fans</span>
              <h2 className="mt-1 text-3xl font-black text-gray-900">Merch Stories & Guides</h2>
              <p className="mt-1 text-gray-400">Spotlights, buying guides, gifting ideas and more.</p>
            </div>
            <Link href="/blog/fans"
              className="hidden text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-orange-500 sm:block">
              View all →
            </Link>
          </div>

          {fansPosts.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-gray-50">
              <p className="text-gray-400">No posts yet — check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fansPosts.map((post) => <PostCard key={post.id} post={post} basePath="/blog/fans" accentColor="orange" />)}
            </div>
          )}

          <div className="mt-6 sm:hidden">
            <Link href="/blog/fans" className="block w-full py-3 text-sm font-semibold text-center text-white bg-black rounded-full hover:bg-gray-800">
              View all fan posts →
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* ── For Creators ── */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-purple-500 uppercase">For Creators</span>
              <h2 className="mt-1 text-3xl font-black text-gray-900">Launch, Grow & Earn</h2>
              <p className="mt-1 text-gray-400">Guides, strategies and success stories for creators.</p>
            </div>
            <Link href="/blog/creators"
              className="hidden text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-purple-500 sm:block">
              View all →
            </Link>
          </div>

          {creatorsPosts.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-gray-50">
              <p className="text-gray-400">No posts yet — check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {creatorsPosts.map((post) => <PostCard key={post.id} post={post} basePath="/blog/creators" accentColor="purple" />)}
            </div>
          )}

          <div className="mt-6 sm:hidden">
            <Link href="/blog/creators" className="block w-full py-3 text-sm font-semibold text-center text-white bg-black rounded-full hover:bg-gray-800">
              View all creator posts →
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

function FeaturedPostCard({ post, basePath, accentColor }: {
  post: Post
  basePath: string
  accentColor: "orange" | "purple"
}) {
  const badge = accentColor === "orange"
    ? "bg-orange-500"
    : "bg-purple-500"
  const accent = accentColor === "orange"
    ? "group-hover:text-orange-500"
    : "group-hover:text-purple-500"

  return (
    <Link href={`${basePath}/${post.slug}`} className="relative flex flex-col flex-1 basis-full overflow-hidden bg-gray-100 rounded-2xl group sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(33.333%-1rem)]">
      <div className="relative overflow-hidden aspect-[16/9] bg-gray-100">
        {post.cover_image ? (
          <Image src={post.cover_image} alt={post.title} fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw" priority />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-5xl bg-gradient-to-br from-gray-50 to-gray-100">
            ✍️
          </div>
        )}
        <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold text-white uppercase tracking-wide rounded-full ${badge}`}>
          Featured
        </span>
      </div>
      <div className="p-5 bg-white">
        <h3 className={`mb-2 text-xl font-bold leading-snug text-gray-900 transition-colors line-clamp-2 ${accent}`}>
          {post.title}
        </h3>
        {post.excerpt && <p className="mb-3 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>}
        <div className="flex items-center text-xs text-gray-400 gap-x-2">
          <span className="font-medium text-gray-600">{post.author_name || "JUNOONI Team"}</span>
          {post.published_at && (
            <>
              <span>·</span>
              <span>{new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </>
          )}
          {post.read_time_minutes && <><span>·</span><span>{post.read_time_minutes} min</span></>}
        </div>
      </div>
    </Link>
  )
}

function PostCard({ post, basePath, accentColor }: {
  post: Post
  basePath: string
  accentColor: "orange" | "purple"
}) {
  const accent = accentColor === "orange"
    ? "group-hover:text-orange-500"
    : "group-hover:text-purple-500"

  return (
    <Link href={`${basePath}/${post.slug}`} className="flex flex-col group">
      <div className="relative mb-4 overflow-hidden bg-gray-100 rounded-xl aspect-video">
        {post.cover_image ? (
          <Image src={post.cover_image} alt={post.title} fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-4xl bg-gradient-to-br from-gray-50 to-gray-100">
            ✍️
          </div>
        )}
      </div>
      <h3 className={`mb-2 text-base font-bold leading-snug text-gray-900 transition-colors line-clamp-2 ${accent}`}>
        {post.title}
      </h3>
      {post.excerpt && <p className="mb-3 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>}
      <div className="flex items-center mt-auto text-xs text-gray-400 gap-x-2">
        <span className="font-medium text-gray-600">{post.author_name || "JUNOONI Team"}</span>
        {post.published_at && (
          <>
            <span>·</span>
            <span>{new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </>
        )}
        {post.read_time_minutes && <><span>·</span><span>{post.read_time_minutes} min</span></>}
      </div>
    </Link>
  )
}