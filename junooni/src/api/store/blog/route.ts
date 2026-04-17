import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"
import BlogModuleService from "../../../modules/blog/service"

const LIST_FIELDS = [
  "id",
  "title",
  "slug",
  "excerpt",
  "cover_image",
  "author_name",
  "author_avatar",
  "category",
  "tags",
  "is_published",
  "published_at",
  "read_time_minutes",
]

// GET /store/blog - list published posts
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)

  const { category, tag, limit = "10", offset = "0" } = req.query as Record<string, string>

  const filters: Record<string, unknown> = { is_published: true }
  if (category) filters.category = category

  const posts = await blogService.listPosts(filters, {
    select: LIST_FIELDS,
    order: { published_at: "DESC" },
    take: parseInt(limit),
    skip: parseInt(offset),
  })

  const filtered = tag
    ? posts.filter((p) => Array.isArray(p.tags) && p.tags.includes(tag))
    : posts

  res.json({
    posts: filtered,
    count: filtered.length,
    limit: parseInt(limit),
    offset: parseInt(offset),
  })
}