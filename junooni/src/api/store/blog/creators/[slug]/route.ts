import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../../modules/blog"
import BlogModuleService from "../../../../../modules/blog/service"

// GET /store/blog/creators/:slug
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)

  const [post] = await blogService.listPosts(
    { slug: req.params.slug, is_published: true, audience: "creators" },
    { take: 1 }
  )

  if (!post) return res.status(404).json({ message: "Post not found" })
  res.json({ post })
}