"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: string
  title: string
  handle: string | null
  thumbnail: string | null
  price: number | null
  currencyCode: string
}

interface Vendor {
  id: string
  name: string
  handle: string
  displayName: string
  bio: string
  profileImage: string | null
  shopUrl: string
  instagramUrl: string | null
  youtubeUrl: string | null
  instagramFollowers: number | null
  youtubeFollowers: number | null
}

interface Props {
  vendor: Vendor
  products: Product[]
}

const formatFollowers = (count: number) => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`
  return count.toString()
}

const formatPrice = (price: number | null, currencyCode: string) => {
  if (price === null) return "Price unavailable"
  const symbol = currencyCode === "INR" ? "₹" : currencyCode === "USD" ? "$" : "₹"
  return `${symbol}${price.toFixed(2)}`
}

export default function CreatorInstagramClient({ vendor, products }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollContainerRef.current
    if (!container) return
    const isMobile = window.innerWidth < 768
    const cardWidth = isMobile ? 144 + 8 : 208 + 16
    container.scrollTo({ left: index * cardWidth, behavior: "smooth" })
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (products.length <= 2) return
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % products.length
        scrollToIndex(next)
        return next
      })
    }, 4000)
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    }
  }, [products.length, scrollToIndex])

  const handleManualScroll = (direction: "left" | "right") => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    setCurrentIndex((prev) => {
      const next =
        direction === "left"
          ? Math.max(0, prev - 1)
          : Math.min(products.length - 1, prev + 1)
      setTimeout(() => scrollToIndex(next), 10)
      return next
    })
  }

  return (
    <section className="py-8 bg-white md:py-16">
      <div className="w-full px-0 mx-auto sm:px-4">
        <h2 className="mb-4 text-2xl font-bold text-center md:mb-10 md:text-3xl">
          Creator Spotlight
        </h2>

        <div className="flex flex-col items-center overflow-hidden bg-white md:flex-row">
          {/* Profile Image */}
          <div className="w-full md:w-2/5">
            <div className="bg-gray-100 aspect-square">
              {vendor.profileImage ? (
                <Image
                  src={vendor.profileImage}
                  alt={`${vendor.displayName} spotlight`}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  // ✅ Priority load — this is above the fold on desktop
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="w-full px-3 py-4 sm:p-4 md:p-6 lg:p-10 md:w-3/5">
            {/* Badge */}
            <div className="mb-4 md:mb-6">
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-orange-100 rounded-full md:px-3 text-orange-primary">
                FEATURED CREATOR
              </span>
            </div>

            {/* Name */}
            <h3 className="mb-3 text-xl font-bold md:mb-4 md:text-2xl lg:text-3xl">
              {vendor.displayName}
            </h3>

            {/* Bio */}
            <p className="mb-4 text-sm leading-relaxed text-gray-600 md:mb-6 md:text-base lg:text-lg">
              {vendor.bio}
            </p>

            {/* Social Stats */}
            <div className="flex flex-wrap gap-3 mb-4 md:gap-4 md:mb-6">
              {vendor.youtubeFollowers && (
                <a
                  href={vendor.youtubeUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="#FF0000">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span className="text-xs text-gray-600 md:text-sm">
                    {formatFollowers(vendor.youtubeFollowers)} followers
                  </span>
                </a>
              )}

              {vendor.instagramFollowers && (
                <a
                  href={vendor.instagramUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="25%" stopColor="#e6683c" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="75%" stopColor="#cc2366" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#ig-grad)"
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                    />
                  </svg>
                  <span className="text-xs text-gray-600 md:text-sm">
                    {formatFollowers(vendor.instagramFollowers)} followers
                  </span>
                </a>
              )}
            </div>

            {/* Products */}
            <div className="mb-4 md:mb-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h4 className="text-base font-semibold md:text-lg">Featured Products</h4>
                <span className="text-xs text-gray-500 md:text-sm">
                  {products.length} product{products.length !== 1 ? "s" : ""}
                </span>
              </div>

              {products.length === 0 ? (
                <div className="flex justify-center py-6">
                  <p className="text-sm text-gray-500">No products available</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Nav arrows */}
                  {products.length > 2 && (
                    <>
                      <button
                        onClick={() => handleManualScroll("left")}
                        disabled={currentIndex === 0}
                        className="absolute left-0 z-10 p-1.5 md:p-2 -translate-y-1/2 rounded-full shadow-lg top-1/2 bg-white/90 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        aria-label="Previous products"
                      >
                        <svg className="w-4 h-4 text-gray-600 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleManualScroll("right")}
                        disabled={currentIndex === products.length - 1}
                        className="absolute right-0 z-10 p-1.5 md:p-2 -translate-y-1/2 rounded-full shadow-lg top-1/2 bg-white/90 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        aria-label="Next products"
                      >
                        <svg className="w-4 h-4 text-gray-600 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Product cards */}
                  <div
                    ref={scrollContainerRef}
                    className="flex gap-2 px-2 pb-4 overflow-x-auto md:gap-4 md:px-4 scroll-smooth snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {products.map((product, index) => {
                      const url = product.handle
                        ? `/products/${product.handle}`
                        : `/products/${product.id}`

                      return (
                        <Link
                          key={product.id}
                          href={url}
                          className="flex-shrink-0 p-2 text-center transition-all duration-300 bg-gray-100 rounded-lg cursor-pointer w-36 md:w-52 md:p-3 snap-start hover:bg-gray-200 hover:shadow-md"
                        >
                          <div className="relative mb-2 overflow-hidden bg-gray-200 rounded md:mb-3 aspect-square">
                            {product.thumbnail ? (
                              <Image
                                src={product.thumbnail}
                                alt={product.title}
                                fill
                                sizes="(max-width: 768px) 144px, 208px"
                                className="object-cover transition-transform hover:scale-105"
                                // ✅ First 3 eager, rest lazy
                                loading={index < 3 ? "eager" : "lazy"}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300" />
                            )}
                          </div>
                          <p className="text-xs md:text-sm font-medium mb-1 line-clamp-2 min-h-[2rem] hover:text-orange-600 transition-colors">
                            {product.title}
                          </p>
                          <p className="text-xs font-medium text-gray-500">
                            {formatPrice(product.price, product.currencyCode)}
                          </p>
                        </Link>
                      )
                    })}

                    {/* View All card */}
                    <Link
                      href={vendor.shopUrl}
                      className="flex-shrink-0 p-2 text-center transition-colors border-2 border-orange-300 border-dashed rounded-lg cursor-pointer w-36 md:w-48 md:p-3 bg-gradient-to-br from-orange-100 to-orange-200 hover:border-orange-400 hover:shadow-md"
                    >
                      <div className="flex items-center justify-center w-full h-full">
                        <div>
                          <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-white rounded-full md:w-12 md:h-12 md:mb-3">
                            <svg className="w-4 h-4 text-orange-500 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <p className="mb-1 text-xs font-medium text-orange-700 md:text-sm">View All</p>
                          <p className="hidden text-xs text-orange-600 md:block">See complete collection</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <a
              href={vendor.shopUrl}
              className="inline-block w-full md:w-auto text-center bg-[#e65100] text-white px-6 md:px-8 py-3 font-medium rounded-md hover:bg-[#d84315] transition"
            >
              Shop Collection
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}