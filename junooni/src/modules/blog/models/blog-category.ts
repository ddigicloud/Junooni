import { model } from "@medusajs/framework/utils"

export const BlogCategory = model.define("blog_category", {
  id: model.id().primaryKey(),
  label: model.text(),   // "Creator Spotlight"
  value: model.text(),   // "creator-spotlight" (slug, unique)
  sort_order: model.number().default(0),
})