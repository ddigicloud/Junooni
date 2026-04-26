import { generateSinglePostMetadata, default as SinglePostPage } from "../../components/single-post"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return generateSinglePostMetadata("fans", params.slug)
}

export default function FansSinglePost({ params }: { params: { slug: string } }) {
  return <SinglePostPage audience="fans" slug={params.slug} />
}