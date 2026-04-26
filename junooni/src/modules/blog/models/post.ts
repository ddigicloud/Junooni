import { model } from "@medusajs/framework/utils"

export const Post = model.define("post", {
  id: model.id().primaryKey(),
  title: model.text(),
  slug: model.text(),
  content: model.text(),
  excerpt: model.text().nullable(),
  cover_image: model.text().nullable(),
  author_name: model.text().nullable(),
  author_avatar: model.text().nullable(),
  category: model.text().nullable(),
  tags: model.array().nullable(),
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),
  is_published: model.boolean().default(false),
  published_at: model.dateTime().nullable(),
  read_time_minutes: model.number().nullable(),
  audience: model.text().nullable(),
  is_featured: model.boolean().default(false),
})