import { generateSinglePostMetadata, default as SinglePostPage } from "../../components/single-post"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return generateSinglePostMetadata("creators", params.slug)
}

export default function CreatorsSinglePost({ params }: { params: { slug: string } }) {
  return <SinglePostPage audience="creators" slug={params.slug} />
}
