export async function GET(req, res) {
  const blogService = req.scope.resolve("blog")
  const [post] = await blogService.listPosts({ 
    slug: req.params.slug, 
    is_published: true 
  })
  if (!post) return res.status(404).json({ message: "Not found" })
  res.json({ post })
}