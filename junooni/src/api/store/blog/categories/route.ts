import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"

// GET /store/blog/categories — public, no auth needed
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const categories = await blogService.listBlogCategories(
    {},
    { order: { sort_order: "ASC" } }
  )
  res.json({ categories })
}