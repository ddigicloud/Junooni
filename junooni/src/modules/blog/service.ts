import { MedusaService } from "@medusajs/framework/utils"
import { Post } from "./models/post"
import { BlogCategory } from "./models/blog-category"

export default class BlogModuleService extends MedusaService({
  Post,
  BlogCategory,
}) {}