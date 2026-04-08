import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"

// GET /admin/blog/:id
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const post = await blogService.retrievePost(req.params.id)
  res.json({ post })
}

// PUT /admin/blog/:id
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const { id } = req.params
  const body = req.body as Record<string, unknown>

  // If publishing for first time, stamp published_at
  let published_at = body.published_at as Date | null | undefined
  if (body.is_published && !published_at) {
    const existing = await blogService.retrievePost(id)
    if (!existing.published_at) {
      published_at = new Date()
    }
  }

  // Recalculate read time if content changed
  const wordCount = ((body.content as string) || "").split(/\s+/).length
  const read_time_minutes = (body.read_time_minutes as number) || Math.ceil(wordCount / 200)

  // Explicitly map every field — spread on updatePosts silently drops unknown fields
  const updateData: Record<string, unknown> = {
    id,
    title:           body.title,
    slug:            body.slug,
    content:         body.content,
    excerpt:         body.excerpt         ?? null,
    cover_image:     body.cover_image     ?? null,
    author_name:     body.author_name     ?? null,
    author_avatar:   body.author_avatar   ?? null,
    category:        body.category        ?? null,
    tags:            body.tags            ?? [],
    seo_title:       body.seo_title       ?? null,
    seo_description: body.seo_description ?? null,
    is_published:    body.is_published    ?? false,
    read_time_minutes,
  }

  if (published_at !== undefined) {
    updateData.published_at = published_at
  }

  const post = await blogService.updatePosts(updateData)
  res.json({ post })
}

// DELETE /admin/blog/:id
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  await blogService.deletePosts(req.params.id)
  res.json({ success: true, id: req.params.id })
}