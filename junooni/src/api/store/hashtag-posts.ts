// FILE: src/api/store/hashtag-posts.ts (Medusa v2 custom route)

import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

// Use a popular existing Instagram hashtag for testing (e.g. #travel)
const approvedPosts: Record<string, string[]> = {
  travel: [
    "https://www.instagram.com/p/C7-Z6D4s8oy/",
    "https://www.instagram.com/p/C7-KkTLMygS/",
    "https://www.instagram.com/p/C7-HOm9McTx/",
  ]
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const hashtag = (req.query.hashtag as string)?.toLowerCase() || "travel";

  const urls = approvedPosts[hashtag] || [];

  return res.json({ urls });
};
