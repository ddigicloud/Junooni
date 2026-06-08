import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Image {
  id: number;
  alt: string;
  url: string;
  width: number;
  height: number;
}

interface DisplayImage {
  id: string;
  title: string | null;
  image: Image;
  caption: string | null;
}

interface ColorOption {
  id: string;
  colorName: string;
  colorHex: string;
}

interface SizeOption {
  id: string;
  sizeName: string;
  sizeDescription: string | null;
}

interface PrintingTechnology {
  id: string;
  technologyName: string;
  customizationAreas: any[];
  mockupPhotos: any[];
}

interface Category {
  id: number;
  title: string;
  slug: string;
  description?: string;
  parent?: number;
}

interface CategoryOption {
  slug: string;
  title: string;
}

interface Product {
  id: number;
  name: string;
  cost: number;
  sku: string;
  brand: string;
  categories: Category[];
  displayImages: DisplayImage[];
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
  printT?: PrintingTechnology[];
  printingTechnologies?: PrintingTechnology[];
  status: string;
  slug: string;
  productType: string;
}

interface ProductMetadata {
  isBestSeller: boolean;
  isStaffPick: boolean;
  rating: number;
  reviewCount: number;
}

type ProductMetadataMap = Record<number, ProductMetadata>;

// ─── Module-level caches ──────────────────────────────────────────────────────

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Per-page product cache: key = "page_N_category_X_search_Y"
const pageCache: Record<string, { data: Product[]; ts: number; totalDocs: number; totalPages: number }> = {};

// Category cache (fetched once, changes rarely)
const categoryCache: { data: CategoryOption[] | null; ts: number } = { data: null, ts: 0 };

// Stable metadata seeded from product id
const metaCache: ProductMetadataMap = {};

function getOrCreateMeta(id: number): ProductMetadata {
  if (!metaCache[id]) {
    const seed = ((id * 9301 + 49297) % 233280) / 233280;
    metaCache[id] = {
      isBestSeller: seed > 0.3,
      isStaffPick: seed > 0.6,
      rating: parseFloat((3.5 + seed * 1.5).toFixed(1)),
      reviewCount: Math.floor(10 + seed * 140),
    };
  }
  return metaCache[id];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCTS_PER_PAGE = 12;
const ALL_CATEGORY: CategoryOption = { slug: "all", title: "All" };

// ─── Select fields (only what ProductCard needs) ──────────────────────────────
const SELECT_FIELDS = [
  "select[id]=true",
  "select[name]=true",
  "select[cost]=true",
  "select[sku]=true",
  "select[brand]=true",
  "select[status]=true",
  "select[slug]=true",
  "select[categories]=true",
  "select[displayImages]=true",
  "select[colorOptions]=true",
  "select[sizeOptions]=true",
  "select[printT][id]=true",
  "select[printT][technologyName]=true",
].join("&");

// ─── Component ────────────────────────────────────────────────────────────────

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>(
    categoryCache.data ?? [ALL_CATEGORY]
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalDocs, setTotalDocs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Debounced search to avoid firing on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountTime = useRef(performance.now());

  // ── Debounce search input ─────────────────────────────────────────────────
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // reset to page 1 on new search
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  // ── Reset page on category change ─────────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // ── Fetch categories once (separate from products, changes rarely) ─────────
  useEffect(() => {
    if (categoryCache.data && Date.now() - categoryCache.ts < CACHE_TTL) {
      setCategories(categoryCache.data);
      return;
    }

    fetch(`${vite_payload}/api/categories?limit=100&depth=0`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data) return;
        const fetched: Category[] = data.docs || data;
        const options: CategoryOption[] = [
          ALL_CATEGORY,
          ...fetched.map((c) => ({ slug: c.slug, title: c.title })),
        ];
        categoryCache.data = options;
        categoryCache.ts = Date.now();
        setCategories(options);
      })
      .catch((err) => console.error("[Catalog] categories fetch error:", err));
  }, []);

  // ── Fetch products on page / category / search change ─────────────────────
  useEffect(() => {
    fetchProducts(currentPage, selectedCategory, debouncedSearch);
  }, [currentPage, selectedCategory, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = useCallback(async (
    page: number,
    category: string,
    search: string
  ) => {
    const fetchStart = performance.now();
    const cacheKey = `page_${page}_cat_${category}_q_${search}`;

    // ── Cache hit
    const cached = pageCache[cacheKey];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      console.log(`[Catalog] ⚡ Cache hit: ${cacheKey} — ${cached.data.length} products`);
      setProducts(cached.data);
      setTotalDocs(cached.totalDocs);
      setTotalPages(cached.totalPages);
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log(`[Catalog] 📡 Fetching page=${page} category=${category} search="${search}"`);
    const requestStart = performance.now();

    try {
      // Build query params
      const params = new URLSearchParams();
      params.set("where[status][equals]", "active");
      params.set("limit", String(PRODUCTS_PER_PAGE));
      params.set("page", String(page));
      params.set("depth", "1");

      // Category filter
      if (category !== "all") {
        params.set("where[categories.slug][equals]", category);
      }

      // Search filter
      if (search.trim()) {
        params.set("where[name][like]", search.trim());
      }

      const url = `${vite_payload}/api/blank-products?${params.toString()}&${SELECT_FIELDS}`;
      console.log(`[Catalog] 🌐 GET ${url.replace(vite_payload, "[PAYLOAD]")}`);

      const response = await fetch(url, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "default",
      });

      const ttfbMs = Math.round(performance.now() - requestStart);
      console.log(`[Catalog] 📬 status=${response.status} TTFB=${ttfbMs}ms`);

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const parseStart = performance.now();
      const data = await response.json();
      const parseMs = Math.round(performance.now() - parseStart);

      const fetched: Product[] = data.docs || [];
      const serverTotalDocs: number = data.totalDocs ?? fetched.length;
      const serverTotalPages: number = data.totalPages ?? Math.ceil(serverTotalDocs / PRODUCTS_PER_PAGE);

      const active = fetched.filter((p) => p.status === "active");
      active.forEach((p) => getOrCreateMeta(p.id));

      console.log(`[Catalog] 📦 parse=${parseMs}ms | active=${active.length} | totalDocs=${serverTotalDocs} totalPages=${serverTotalPages}`);
      console.log(`[Catalog] 🔍 TTFB=${ttfbMs}ms | parse=${parseMs}ms | total=${ttfbMs + parseMs}ms`);

      // Store in cache
      pageCache[cacheKey] = {
        data: active,
        ts: Date.now(),
        totalDocs: serverTotalDocs,
        totalPages: serverTotalPages,
      };

      setProducts(active);
      setTotalDocs(serverTotalDocs);
      setTotalPages(serverTotalPages);

      const totalMs = Math.round(performance.now() - mountTime.current);
      console.log(`%c[Catalog] ✅ Rendered page=${page} in ${Math.round(performance.now() - fetchStart)}ms | since mount=${totalMs}ms`, "color: green; font-weight: bold");

      if (ttfbMs > 3000) console.warn(`[Catalog] 🔴 SLOW TTFB (${ttfbMs}ms)`);
      if (parseMs > 500)  console.warn(`[Catalog] 🔴 SLOW PARSE (${parseMs}ms)`);

    } catch (err) {
      console.error("[Catalog] ❌ fetchProducts failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Page change ───────────────────────────────────────────────────────────
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage) return;
    console.log(`[Catalog] 📄 Page: ${currentPage} → ${page}`);
    setCurrentPage(page);
    setProducts([]);
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // ── Pagination buttons ────────────────────────────────────────────────────
  const PaginationButtons = useCallback(() => {
    if (totalPages <= 1) return null;
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    const pageBtn = (
      key: string | number,
      label: React.ReactNode,
      page: number,
      active = false,
      disabled = false
    ) => (
      <button
        key={key}
        onClick={() => !disabled && handlePageChange(page)}
        disabled={disabled}
        className={`px-4 py-2 border rounded-lg transition-colors ${
          active
            ? "bg-[#E8552A] text-white border-[#E8552A]"
            : disabled
            ? "border-gray-300 opacity-50 cursor-not-allowed"
            : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        {label}
      </button>
    );

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
        {pageBtn("prev", "Previous", currentPage - 1, false, currentPage === 1)}
        {start > 1 && (
          <>
            {pageBtn(1, 1, 1)}
            {start > 2 && <span key="d1" className="px-2">…</span>}
          </>
        )}
        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((i) =>
          pageBtn(i, i, i, i === currentPage)
        )}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span key="d2" className="px-2">…</span>}
            {pageBtn(totalPages, totalPages, totalPages)}
          </>
        )}
        {pageBtn("next", "Next", currentPage + 1, false, currentPage === totalPages)}
      </div>
    );
  }, [currentPage, totalPages, handlePageChange]);

  // Page range for stats bar
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * PRODUCTS_PER_PAGE, totalDocs);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E8552A] to-[#ff9800] opacity-5" />
        <div className="relative px-4 pt-20 pb-16 mx-auto mt-8 max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-3xl lg:text-5xl dark:text-white">
              Build Your Vision
              <span className="block text-[#E8552A] text-2xl md:text-3xl lg:text-3xl font-medium mt-2">
                Choose from Premium Products
              </span>
            </h1>
            <p className="max-w-3xl mx-auto mb-8 text-lg text-gray-600 dark:text-gray-300">
              Transform your ideas into reality with our curated collection of high-quality blank products,
              perfect for customization and branding.
            </p>
          </div>

          {/* Search + Filter */}
          <div className="max-w-4xl mx-auto">
            <div className="p-3 bg-white border border-gray-200 shadow-xl dark:bg-gray-800 rounded-2xl dark:border-gray-700">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#E8552A] focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                    />
                  </div>
                </div>
                <div className="lg:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setProducts([]);
                    }}
                    className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#E8552A] focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-4 pb-8 mx-auto sm:pb-20 max-w-7xl sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="flex flex-col items-start justify-between p-6 mb-8 bg-white border border-gray-200 shadow-sm sm:flex-row sm:items-center dark:bg-gray-800 rounded-xl dark:border-gray-700">
          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">Product Catalog</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {loading ? "Loading..." : `${totalDocs} products available`}
              {!loading && totalDocs > 0 && (
                <span className="ml-2 text-sm">
                  (Showing {startIndex}–{endIndex} of {totalDocs})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  metadata={getOrCreateMeta(product.id)}
                />
              ))}
            </div>
            <PaginationButtons />
          </>
        ) : (
          <div className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full dark:bg-gray-800">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">No products found</h3>
              <p className="mb-6 text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setProducts([]); }}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-[#E8552A] hover:bg-[#d84315] transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;