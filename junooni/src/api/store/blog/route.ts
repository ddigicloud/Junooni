export async function GET(req, res) {
  const blogService = req.scope.resolve("blog")
  const posts = await blogService.listPosts(
    { is_published: true },
    { order: { published_at: "DESC" } }
  )
  res.json({ posts })
}