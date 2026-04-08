import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"

// GET /admin/blog/categories
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const categories = await blogService.listBlogCategories(
    {},
    { order: { sort_order: "ASC" } }
  )
  res.json({ categories })
}

// POST /admin/blog/categories
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const { label, value, sort_order } = req.body as Record<string, unknown>

  if (!label || !value) {
    return res.status(400).json({ message: "label and value are required" })
  }

  // Check duplicate
  const existing = await blogService.listBlogCategories({ value: value as string })
  if (existing.length > 0) {
    return res.status(409).json({ message: `Category "${value}" already exists` })
  }

  const category = await blogService.createBlogCategories({
    label: label as string,
    value: value as string,
    sort_order: (sort_order as number) ?? 0,
  })

  res.status(201).json({ category })
}