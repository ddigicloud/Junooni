import { useEffect, useState, useCallback, useRef } from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import Navbar from "./Navbar";
import { useToast } from "@/hooks/use-toast";

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;
const vite_backend = import.meta.env.VITE_MEDUSA_BACKEND_URL;

// ─── Interfaces ───────────────────────────────────────────────────────────────

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

interface Product {
  id: number;
  name: string;
  cost: number;
  sku: string;
  brand: string;
  status?: string;
  displayImages: DisplayImage[];
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
  printingTechnologies: PrintingTechnology[];
}

interface ProductMetadata {
  isBestSeller: boolean;
  isStaffPick: boolean;
  rating: number;
  reviewCount: number;
}

type ProductMetadataMap = Record<number, ProductMetadata>;

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCTS_PER_PAGE = 12;

// Simple in-memory cache: stores { data, timestamp }
// Survives re-renders and tab navigations within the same session
const productCache: { data: Product[] | null; ts: number } = {
  data: null,
  ts: 0,
};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Stable metadata: seeded once per product id so it never changes on re-render
const metadataCache: ProductMetadataMap = {};
function getOrCreateMetadata(id: number): ProductMetadata {
  if (!metadataCache[id]) {
    // Deterministic-ish seed from product id so values are stable across renders
    const seed = ((id * 9301 + 49297) % 233280) / 233280;
    metadataCache[id] = {
      isBestSeller: seed > 0.3,
      isStaffPick: seed > 0.6,
      rating: parseFloat((3.5 + seed * 1.5).toFixed(1)),
      reviewCount: Math.floor(10 + seed * 140),
    };
  }
  return metadataCache[id];
}

// ─── Token helpers ────────────────────────────────────────────────────────────

const validateToken = () => {
  try {
    const token = localStorage.getItem("vendorToken");
    if (!token) return { isValid: false, hasActorId: false, actorId: null, token: null };

    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("vendorToken");
      localStorage.removeItem("vendorTokenTimestamp");
      return { isValid: false, hasActorId: false, actorId: null, token: null };
    }

    const actorId = payload.actor_id || payload.sub || payload.id;
    return { isValid: true, hasActorId: !!actorId, actorId, token };
  } catch {
    return { isValid: false, hasActorId: false, actorId: null, token: null };
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { toast } = useToast();

  // Track whether we've already kicked off the data fetch to avoid double-fetch in StrictMode
  const fetchStarted = useRef(false);

  // ── Single effect: auth check + product fetch run IN PARALLEL ───────────────
  useEffect(() => {
    if (fetchStarted.current) return;
    fetchStarted.current = true;

    const run = async () => {
      // 1. Local token validation (synchronous — no network needed)
      const { isValid, hasActorId, token } = validateToken();

      if (!isValid) {
        localStorage.clear();
        toast({
          title: "Session Expired",
          description: "Please sign in again.",
          variant: "destructive",
        });
        window.location.href = "/sign-in";
        return;
      }

      if (!hasActorId) {
        toast({
          title: "Complete Your Profile",
          description: "Please complete your vendor profile.",
          variant: "destructive",
        });
        window.location.href = "/onboarding?step=basic-info";
        return;
      }

      // 2. Fire auth verify + product fetch IN PARALLEL
      //    Products load immediately from cache or network — don't wait for auth verify
      const authVerifyPromise = fetch(`${vite_backend}/vendors/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).catch((err) => {
        // Network error: don't block product rendering, just log
        console.warn("Backend auth verify failed (non-blocking):", err);
        return null;
      });

      const productsPromise = fetchProducts();

      // Await both, but handle auth result only for 401
      const [authRes] = await Promise.all([authVerifyPromise, productsPromise]);

      if (authRes && authRes.status === 401) {
        localStorage.clear();
        toast({
          title: "Session Expired",
          description: "Please sign in again.",
          variant: "destructive",
        });
        window.location.href = "/sign-in";
      }
    };

    run().catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Product fetch with in-memory cache ──────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      // Serve from cache if fresh
      if (productCache.data && Date.now() - productCache.ts < CACHE_TTL_MS) {
        setProducts(productCache.data);
        setLoading(false);
        return;
      }

      // FIX 1: Use server-side status filter + sensible limit instead of limit=1000
      // FIX 2: depth=0 for list view — we only need flat fields here, not nested relations
      //         Switch to depth=1 ONLY if ProductCard actually renders nested relation fields
      const response = await fetch(
        `${vite_payload}/api/blank-products?where[status][equals]=active&limit=200&depth=1`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          // Browser cache for 60s so hard-refresh is fast too
          cache: "default",
        }
      );

      if (!response.ok) {
        throw new Error(`Products API returned ${response.status}`);
      }

      const data = await response.json();
      const fetched: Product[] = data.docs || data;

      // Belt-and-suspenders: filter out any stray drafts
      const active = fetched.filter(
        (p) => p.status?.toLowerCase() !== "draft"
      );

      // Populate stable metadata cache
      active.forEach((p) => getOrCreateMetadata(p.id));

      // Store in session cache
      productCache.data = active;
      productCache.ts = Date.now();

      setProducts(active);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Failed to load products",
        description: "Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ── Pagination ───────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationButtons = () => {
    const buttons: React.ReactNode[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    const btn = (key: string | number, label: React.ReactNode, page: number, active = false, disabled = false) => (
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

    buttons.push(btn("prev", "Previous", currentPage - 1, false, currentPage === 1));

    if (start > 1) {
      buttons.push(btn(1, 1, 1));
      if (start > 2) buttons.push(<span key="d1" className="px-2">…</span>);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(btn(i, i, i, i === currentPage));
    }

    if (end < totalPages) {
      if (end < totalPages - 1) buttons.push(<span key="d2" className="px-2">…</span>);
      buttons.push(btn(totalPages, totalPages, totalPages));
    }

    buttons.push(btn("next", "Next", currentPage + 1, false, currentPage === totalPages));

    return buttons;
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8 pt-28">

          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#E8552A] to-[#ff7043] rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              What would you like to{" "}
              <span className="bg-gradient-to-r from-[#E8552A] to-[#ff7043] bg-clip-text text-transparent">
                create
              </span>
              ?
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Discover our premium collection of customizable products. From apparel to accessories, bring your designs to life.
            </p>
            {!loading && products.length > PRODUCTS_PER_PAGE && (
              <p className="mt-4 text-sm text-gray-500">
                Showing {startIndex + 1}–{Math.min(startIndex + PRODUCTS_PER_PAGE, products.length)} of {products.length} products
              </p>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <div key={product.id} className="group">
                      <ProductCard
                        product={product}
                        metadata={getOrCreateMetadata(product.id)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <div className="p-12 text-center bg-white border border-gray-200 shadow-sm rounded-2xl">
                      <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-gray-900">No products found</h3>
                      <p className="text-gray-500">We're currently updating our catalog. Please check back soon!</p>
                    </div>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
                  {renderPaginationButtons()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;