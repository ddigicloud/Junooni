import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"

const LIST_FIELDS = [
  "id", "title", "slug", "excerpt", "cover_image",
  "author_name", "audience", "category", "tags",
  "is_featured", "published_at", "read_time_minutes",
]

// GET /store/blog/fans
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const { limit = "20", offset = "0" } = req.query as Record<string, string>

  // Get featured post first
  const [featuredPost] = await blogService.listPosts(
    { is_published: true, audience: "fans", is_featured: true },
    { select: LIST_FIELDS, take: 1 }
  )

  // Get all published posts (excluding featured)
  const posts = await blogService.listPosts(
    { is_published: true, audience: "fans" },
    {
      select: LIST_FIELDS,
      order: { published_at: "DESC" },
      take: parseInt(limit),
      skip: parseInt(offset),
    }
  )

  res.json({ posts, featured_post: featuredPost || null, count: posts.length })
}