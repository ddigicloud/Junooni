// import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { BLOG_MODULE } from "../../../../modules/blog"
// import BlogModuleService from "../../../../modules/blog/service"

// // GET /admin/blog/:id — returns all fields for editing
// export async function GET(req: MedusaRequest, res: MedusaResponse) {
//   const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)

//   const post = await blogService.retrievePost(req.params.id, {
//     select: [
//       "id", "title", "slug", "content", "excerpt",
//       "cover_image", "author_name", "author_avatar",
//       "category", "tags", "seo_title", "seo_description",
//       "is_published", "published_at", "read_time_minutes",
//       "created_at", "updated_at",
//     ],
//   })

//   res.json({ post })
// }

// // PUT /admin/blog/:id
// export async function PUT(req: MedusaRequest, res: MedusaResponse) {
//   const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
//   const { id } = req.params
//   const body = req.body as Record<string, unknown>

//   let published_at = body.published_at as Date | null | undefined
//   if (body.is_published && !published_at) {
//     const existing = await blogService.retrievePost(id)
//     if (!existing.published_at) {
//       published_at = new Date()
//     }
//   }

//   const wordCount = ((body.content as string) || "").split(/\s+/).length
//   const read_time_minutes = (body.read_time_minutes as number) || Math.ceil(wordCount / 200)

//   const updateData: Record<string, unknown> = {
//     id,
//     title:           body.title,
//     slug:            body.slug,
//     content:         body.content,
//     excerpt:         body.excerpt         ?? null,
//     cover_image:     body.cover_image     ?? null,
//     author_name:     body.author_name     ?? null,
//     author_avatar:   body.author_avatar   ?? null,
//     category:        body.category        ?? null,
//     tags:            body.tags            ?? [],
//     seo_title:       body.seo_title       ?? null,
//     seo_description: body.seo_description ?? null,
//     is_published:    body.is_published    ?? false,
//     read_time_minutes,
//   }

//   if (published_at !== undefined) {
//     updateData.published_at = published_at
//   }

//   const post = await blogService.updatePosts(updateData)
//   res.json({ post })
// }

// // DELETE /admin/blog/:id
// export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
//   const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
//   await blogService.deletePosts(req.params.id)
//   res.json({ success: true, id: req.params.id })
// }

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"

const POST_FIELDS = [
  "id", "title", "slug", "content", "excerpt",
  "cover_image", "author_name", "author_avatar",
  "audience", "category", "tags",
  "seo_title", "seo_description",
  "is_published", "is_featured", "published_at", "read_time_minutes",
  "created_at", "updated_at",
]

// GET /admin/blog/:id
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const post = await blogService.retrievePost(req.params.id, { select: POST_FIELDS })
  res.json({ post })
}

// PUT /admin/blog/:id
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const { id } = req.params
  const body = req.body as Record<string, unknown>

  let published_at = body.published_at as Date | null | undefined
  if (body.is_published && !published_at) {
    const existing = await blogService.retrievePost(id)
    if (!existing.published_at) published_at = new Date()
  }

  const wordCount = ((body.content as string) || "").split(/\s+/).length
  const read_time_minutes = (body.read_time_minutes as number) || Math.ceil(wordCount / 200)

  const updateData: Record<string, unknown> = {
    id,
    title:           body.title,
    slug:            body.slug,
    content:         body.content,
    excerpt:         body.excerpt         ?? null,
    cover_image:     body.cover_image     ?? null,
    author_name:     body.author_name     ?? null,
    author_avatar:   body.author_avatar   ?? null,
    audience:        body.audience        ?? null,
    category:        body.category        ?? null,
    tags:            body.tags            ?? [],
    seo_title:       body.seo_title       ?? null,
    seo_description: body.seo_description ?? null,
    is_published:    body.is_published    ?? false,
    is_featured:     body.is_featured     ?? false,
    read_time_minutes,
  }

  if (published_at !== undefined) updateData.published_at = published_at

  const post = await blogService.updatePosts(updateData)
  res.json({ post })
}

// DELETE /admin/blog/:id
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  await blogService.deletePosts(req.params.id)
  res.json({ success: true, id: req.params.id })
}