"use client"

import { useRef } from "react"

type Creator = {
  id: string
  name: string
  handle?: string
  photo?: string | null
  logo?: string | null
  avatar?: string | null
}

function CreatorAvatar({ creator }: { creator: Creator }) {
  const image = creator.photo || creator.logo || creator.avatar || null
  const initials = creator.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <a
      href={`/creators/${creator.handle || creator.id}`}
      className="flex flex-col items-center gap-2 flex-shrink-0 group w-14 md:w-20 mt-2"
    >
      <div className="w-11 h-11 md:w-16 md:h-16 rounded-full ring-2 ring-orange-400 ring-offset-2 ring-offset-white overflow-hidden bg-gray-100 transition-all group-hover:scale-105">
        {image ? (
          <img
            src={image}
            alt={creator.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-400 font-bold text-lg">
            {initials}
          </div>
        )}
      </div>
      <span className="text-[10px] md:text-[11px] leading-tight text-gray-700 text-center w-full truncate group-hover:text-orange-500 transition-colors px-1">
        {creator.name}
      </span>
    </a>
  )
}

export default function FeaturedCreatorsStrip({
  creators,
}: {
  creators: Creator[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!creators?.length) return null

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" })
  }

  return (
    <div className="w-full bg-[#FFF7F4] border-b border-orange-100 px-4 py-5 small:px-6 mt-16">
      <div className="content-container">
        {/* Header */}
        <div className="flex items-start gap-2 mb-1">
          {/* decorative squiggle — simple SVG inline */}
          {/* <svg width="28" height="24" viewBox="0 0 28 24" fill="none" className="mt-1 flex-shrink-0">
            <path d="M2 12 C6 4, 10 20, 14 12 S22 4, 26 12" stroke="#F97316" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg> */}
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.15em] leading-none mb-0.5">
              Featured Creators
            </p>
            <h2 className="text-base small:text-lg font-bold text-gray-900 leading-snug">
              Shop from Your Favourite Creators
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Unique designs, real stories, and merch from creators you love.
            </p>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative mt-4">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute -left-8 top-1/3 -translate-y-1/2 z-10 w-7 h-7 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-200 transition-colors text-lg leading-none"
          >
            ‹
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-8 overflow-x-auto scroll-smooth pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {creators.map((creator) => (
              <CreatorAvatar key={creator.id} creator={creator} />
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute -right-8 top-1/3 -translate-y-1/2 z-10 w-7 h-7 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-200 transition-colors text-lg leading-none"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}