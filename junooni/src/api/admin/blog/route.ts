import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"
import BlogModuleService from "../../../modules/blog/service"

// GET /admin/blog - list all posts (published + drafts)
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)

  const { limit = "20", offset = "0", is_published } = req.query as Record<string, string>

  const filters: Record<string, unknown> = {}
  if (is_published !== undefined) {
    filters.is_published = is_published === "true"
  }

  const posts = await blogService.listPosts(filters, {
    order: { created_at: "DESC" },
    take: parseInt(limit),
    skip: parseInt(offset),
  })

  res.json({ posts, count: posts.length })
}

// POST /admin/blog - create new post
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const body = req.body as Record<string, unknown>

  const title   = body.title   as string
  const content = body.content as string || ""

  // Auto-generate slug if not provided
  const slug = (body.slug as string) ||
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")

  // Auto-calculate read time (avg 200 words/min)
  const wordCount    = content.split(/\s+/).filter(Boolean).length
  const read_time_minutes = (body.read_time_minutes as number) || Math.ceil(wordCount / 200)

  const is_published = (body.is_published as boolean) || false

  // Explicitly map every field
  const post = await blogService.createPosts({
    title,
    slug,
    content,
    excerpt:         (body.excerpt         as string)  || null,
    cover_image:     (body.cover_image     as string)  || null,
    author_name:     (body.author_name     as string)  || "JUNOONI Team",
    author_avatar:   (body.author_avatar   as string)  || null,
    category:        (body.category        as string)  || null,
    tags:            (body.tags            as string[]) || [],
    seo_title:       (body.seo_title       as string)  || title,
    seo_description: (body.seo_description as string)  || (body.excerpt as string) || null,
    is_published,
    published_at:    is_published ? new Date() : null,
    read_time_minutes,
  })

  res.status(201).json({ post })
}