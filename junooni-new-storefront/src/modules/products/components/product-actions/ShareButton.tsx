"use client";

import { useState } from "react";
import { Share2, Copy, Facebook, Twitter, MessageCircle, Instagram } from "lucide-react";

export default function ShareButton({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyPosition, setCopyPosition] = useState<{ x: number; y: number } | null>(null);

  const handleCopy = async (e: React.MouseEvent) => {
    try {
      await navigator.clipboard.writeText(url);
      setOpen(false); // First close dropdown
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setCopyPosition({ x: rect.left + rect.width / 2, y: rect.top }); // Set popup near clicked button
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setCopyPosition(null);
      }, 1000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:border-[#e65100] hover:text-[#e65100] transition"
        >
          <Share2 size={20} />
        </button>

        {open && (
          <div className="absolute right-0 z-50 w-48 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
            <ul className="p-2">
              <li>
                <button
                  onClick={handleCopy}
                  className="flex items-center w-full gap-2 px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-[#E65100] hover:text-white"
                >
                  <Copy size={16} /> Copy Link
                </button>
              </li>
              <li>
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full gap-2 px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-[#E65100] hover:text-white"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full gap-2 px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-[#E65100] hover:text-white"
                >
                  <Twitter size={16} /> Twitter
                </a>
              </li>
              <li>
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full gap-2 px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-[#E65100] hover:text-white"
                >
                  <Facebook size={16} /> Facebook
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>

      {copied && copyPosition && (
        <div
        className="fixed px-2 py-1 text-xs text-white rounded shadow-md"
        style={{
          backgroundColor: "#E65100",
          top: copyPosition.y + 6, // (+6 instead of -6 for better positioning)
          left: copyPosition.x,
          transform: "translate(-50%, -100%)",
          zIndex: 1000,
        }}
      >
        Copied!
      </div>      
      )}
    </>
  );
}
