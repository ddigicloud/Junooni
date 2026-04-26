// import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { BLOG_MODULE } from "../../../modules/blog"
// import BlogModuleService from "../../../modules/blog/service"

// // All fields we want returned — must be explicit or Medusa drops custom columns
// const POST_FIELDS = [
//   "id",
//   "title",
//   "slug",
//   "content",
//   "excerpt",
//   "cover_image",
//   "author_name",
//   "author_avatar",
//   "category",
//   "tags",
//   "seo_title",
//   "seo_description",
//   "is_published",
//   "published_at",
//   "read_time_minutes",
//   "created_at",
//   "updated_at",
// ]

// // GET /admin/blog - list all posts (published + drafts)
// export async function GET(req: MedusaRequest, res: MedusaResponse) {
//   const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)

//   const { limit = "20", offset = "0", is_published } = req.query as Record<string, string>

//   const filters: Record<string, unknown> = {}
//   if (is_published !== undefined) {
//     filters.is_published = is_published === "true"
//   }

//   const posts = await blogService.listPosts(filters, {
//     select: POST_FIELDS,
//     order: { created_at: "DESC" },
//     take: parseInt(limit),
//     skip: parseInt(offset),
//   })

//   res.json({ posts, count: posts.length })
// }

// // POST /admin/blog - create new post
// export async function POST(req: MedusaRequest, res: MedusaResponse) {
//   const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
//   const body = req.body as Record<string, unknown>

//   const title   = body.title   as string
//   const content = body.content as string || ""

//   const slug = (body.slug as string) ||
//     title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")

//   const wordCount = content.split(/\s+/).filter(Boolean).length
//   const read_time_minutes = (body.read_time_minutes as number) || Math.ceil(wordCount / 200)

//   const is_published = (body.is_published as boolean) || false

//   const post = await blogService.createPosts({
//     title,
//     slug,
//     content,
//     excerpt:         (body.excerpt         as string)  || null,
//     cover_image:     (body.cover_image     as string)  || null,
//     author_name:     (body.author_name     as string)  || "JUNOONI Team",
//     author_avatar:   (body.author_avatar   as string)  || null,
//     category:        (body.category        as string)  || null,
//     tags:            (body.tags            as string[]) || [],
//     seo_title:       (body.seo_title       as string)  || title,
//     seo_description: (body.seo_description as string)  || (body.excerpt as string) || null,
//     is_published,
//     published_at:    is_published ? new Date() : null,
//     read_time_minutes,
//   })

//   res.json({ post })
// }

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"
import BlogModuleService from "../../../modules/blog/service"

const POST_FIELDS = [
  "id", "title", "slug", "content", "excerpt",
  "cover_image", "author_name", "author_avatar",
  "audience", "category", "tags",
  "seo_title", "seo_description",
  "is_published", "is_featured", "published_at", "read_time_minutes",
  "created_at", "updated_at",
]

// GET /admin/blog
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const { limit = "50", offset = "0", audience, is_published } = req.query as Record<string, string>

  const filters: Record<string, unknown> = {}
  if (audience) filters.audience = audience
  if (is_published !== undefined) filters.is_published = is_published === "true"

  const posts = await blogService.listPosts(filters, {
    select: POST_FIELDS,
    order: { created_at: "DESC" },
    take: parseInt(limit),
    skip: parseInt(offset),
  })

  res.json({ posts, count: posts.length })
}

// POST /admin/blog
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const body = req.body as Record<string, unknown>

  const title   = body.title as string
  const content = body.content as string || ""
  const slug    = (body.slug as string) || title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")
  const wordCount = content.split(/\s+/).filter(Boolean).length
  const read_time_minutes = (body.read_time_minutes as number) || Math.ceil(wordCount / 200)
  const is_published = (body.is_published as boolean) || false

  const post = await blogService.createPosts({
    title,
    slug,
    content,
    excerpt:         (body.excerpt         as string)  || null,
    cover_image:     (body.cover_image     as string)  || null,
    author_name:     (body.author_name     as string)  || "JUNOONI Team",
    author_avatar:   (body.author_avatar   as string)  || null,
    audience:        (body.audience        as string)  || null,
    category:        (body.category        as string)  || null,
    tags:            (body.tags            as string[]) || [],
    seo_title:       (body.seo_title       as string)  || title,
    seo_description: (body.seo_description as string)  || null,
    is_published,
    is_featured:     (body.is_featured     as boolean) || false,
    published_at:    is_published ? new Date() : null,
    read_time_minutes,
  })

  res.status(201).json({ post })
}