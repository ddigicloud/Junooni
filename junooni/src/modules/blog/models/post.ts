import { model } from "@medusajs/framework/utils"

export const Post = model.define("post", {
  id: model.id().primaryKey(),
  title: model.text(),
  slug: model.text().unique(),
  content: model.text(),  // store HTML/markdown
  excerpt: model.text().nullable(),
  cover_image: model.text().nullable(),
  author_name: model.text().nullable(),
  is_published: model.boolean().default(false),
  published_at: model.dateTime().nullable(),
  tags: model.array().nullable(),  // ["creator-economy", "merchandise"]
})