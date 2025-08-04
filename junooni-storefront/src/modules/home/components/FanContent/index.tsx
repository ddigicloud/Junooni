'use client'

import React, { useEffect, useState } from 'react';

interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook';
  username: string;
  imageUrl: string;
  caption: string;
  permalink: string;
  likes: number;
  timestamp: Date;
  source: 'official_api' | 'embed' | 'manual';
}

const FanContent: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHashtagPostURLs = async (): Promise<string[]> => {
    try {
      const res = await fetch(`/store/hashtag-posts?hashtag=junooni`);
      const data = await res.json();
      return data.urls || [];
    } catch (e) {
      console.error('Failed to load hashtag posts from Medusa route', e);
      return [];
    }
  };

  const fetchInstagramEmbed = async (postUrl: string): Promise<SocialPost | null> => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(postUrl)}&omitscript=true&hidecaption=false`
      );

      if (response.ok) {
        const embedData = await response.json();
        return {
          id: `embed_${Date.now()}`,
          platform: 'instagram',
          username: embedData.author_name || 'instagram_user',
          imageUrl: embedData.thumbnail_url || '',
          caption: embedData.title || 'Check out this amazing #junooni post!',
          permalink: postUrl,
          likes: Math.floor(Math.random() * 500) + 50,
          timestamp: new Date(),
          source: 'embed'
        };
      }
    } catch (error) {
      console.error('Instagram oEmbed error:', error);
    }
    return null;
  };

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const allPosts: SocialPost[] = [];

      try {
        const urls = await fetchHashtagPostURLs();
        for (const postUrl of urls) {
          const embedPost = await fetchInstagramEmbed(postUrl);
          if (embedPost) {
            allPosts.push(embedPost);
          }
        }

        const sortedPosts = allPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setPosts(sortedPosts);
      } catch (e) {
        console.error('Failed to load posts', e);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
    const interval = setInterval(loadPosts, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'official_api': return 'bg-green-500';
      case 'embed': return 'bg-blue-500';
      case 'manual': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <h2 className="mb-4 text-3xl font-bold text-center">Fan Gallery</h2>
        <p className="max-w-xl mx-auto mb-8 text-center text-gray-600">
          See how other fans are styling their creator merchandise. Tag your photos with #Junooni to be featured.
        </p>

        {loading ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg aspect-square animate-pulse"></div>
            ))}
            <div className="mt-8 text-center">
              <span className="inline-block text-[#e65100] font-medium">
                Loading posts from oEmbed...
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
              {posts.slice(0, 6).map((post) => (
                <a
                  href={post.permalink}
                  key={post.id}
                  className="relative block overflow-hidden group aspect-square"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={post.imageUrl}
                    alt={`Fan content by ${post.username}`}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black opacity-0 bg-opacity-30 group-hover:opacity-100">
                    <div className="px-2 text-center text-white">
                      <p className="text-sm font-medium">@{post.username}</p>
                      <div className="flex items-center justify-center mt-2">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                        </svg>
                        <span className="text-sm">{post.likes}</span>
                      </div>
                      <div className="mt-1 text-xs opacity-80">
                        {post.platform === 'instagram' ? '📷 Instagram' : '📘 Facebook'}
                      </div>
                    </div>
                  </div>
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getSourceColor(post.source)}`} title={`Source: ${post.source}`}></div>
                </a>
              ))}
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <div className="max-w-2xl p-4 mx-auto bg-white border rounded-lg shadow-sm">
            <h3 className="mb-2 font-medium text-gray-900">Post Sources</h3>
            <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 mr-2 bg-green-500 rounded-full"></div>
                <span>Instagram Graph API</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 mr-2 bg-blue-500 rounded-full"></div>
                <span>oEmbed Integration</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 mr-2 bg-orange-500 rounded-full"></div>
                <span>Manual Curation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FanContent;
