import { useEffect, useState, useCallback, useRef } from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import Navbar from "./Navbar";
import { useToast } from "@/hooks/use-toast";
import { getVendorMe } from "@/lib/authCache";

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

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
  printT?: PrintingTechnology[];            // actual Payload field name
  printingTechnologies?: PrintingTechnology[]; // fallback alias
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

// ── Per-page cache: key = page number, value = { data, ts }
// Survives re-renders and back/forward navigation within the same session.
const pageCache: Record<number, { data: Product[]; ts: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes per page

// ── Stable metadata: seeded once per product id, never changes on re-render
const metadataCache: ProductMetadataMap = {};
function getOrCreateMetadata(id: number): ProductMetadata {
  if (!metadataCache[id]) {
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
  const [totalDocs, setTotalDocs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { toast } = useToast();

  const authDone = useRef(false);
  const mountTime = useRef(performance.now());

  // ── Auth: runs once on mount, fire-and-forget, never blocks product render
  useEffect(() => {
    if (authDone.current) return;
    authDone.current = true;

    console.log("%c[Products] 🟡 Component mounted", "color: orange; font-weight: bold");
    console.log(`[Products] ⏱ Mount timestamp: ${new Date().toISOString()}`);

    const tokenStart = performance.now();
    const { isValid, hasActorId, token } = validateToken();
    console.log(`[Products] 🔑 Token validation: ${Math.round(performance.now() - tokenStart)}ms → isValid=${isValid} hasActorId=${hasActorId}`);

    if (!isValid) {
      localStorage.clear();
      toast({ title: "Session Expired", description: "Please sign in again.", variant: "destructive" });
      window.location.href = "/sign-in";
      return;
    }

    if (!hasActorId) {
      toast({ title: "Complete Your Profile", description: "Please complete your vendor profile.", variant: "destructive" });
      window.location.href = "/onboarding?step=basic-info";
      return;
    }

    // Auth verify runs in background via shared cache —
    // if ProfileDropdown already called getVendorMe, this returns instantly from cache
    const authStart = performance.now();
    console.log("[Products] 🔐 Starting background auth verify (via authCache)...");
    getVendorMe(token).then((res) => {
      const authMs = Math.round(performance.now() - authStart);
      if (res?.status === 401) {
        console.warn(`[Products] ❌ Auth 401 after ${authMs}ms — redirecting`);
        localStorage.clear();
        toast({ title: "Session Expired", description: "Please sign in again.", variant: "destructive" });
        window.location.href = "/sign-in";
      } else {
        const cached = authMs < 5;
        console.log(`[Products] ✅ Auth verify ${authMs}ms ${cached ? "(from cache ⚡)" : "(network)"} → status=${res?.status}`);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch products whenever currentPage changes
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Server-side paginated fetch — only 12 products per request
  const fetchProducts = useCallback(async (page: number) => {
    const fetchStart = performance.now();

    try {
      // ── Cache hit for this page
      const cached = pageCache[page];
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        console.log(`[Products] ⚡ Cache hit page=${page} — serving ${cached.data.length} products instantly`);
        setProducts(cached.data);
        setLoading(false);
        const totalMs = Math.round(performance.now() - mountTime.current);
        console.log(`%c[Products] ✅ Cards visible (cache) — ${totalMs}ms since mount`, "color: green; font-weight: bold");
        return;
      }

      console.log(`[Products] 📡 Fetching page=${page} from Payload...`);
      const requestStart = performance.now();

      const selectFields = [
        "select[id]=true",
        "select[name]=true",
        "select[cost]=true",
        "select[sku]=true",
        "select[brand]=true",
        "select[status]=true",
        "select[displayImages]=true",
        "select[colorOptions]=true",
        "select[sizeOptions]=true",
        "select[printT][id]=true",
        "select[printT][technologyName]=true",
      ].join("&");

      const url = `${vite_payload}/api/blank-products?where[status][equals]=active&limit=${PRODUCTS_PER_PAGE}&page=${page}&depth=1&${selectFields}`;
      console.log(`[Products] 🌐 GET ${url.replace(vite_payload, "[PAYLOAD]")}`);

      const response = await fetch(url, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "default",
      });

      const ttfbMs = Math.round(performance.now() - requestStart);
      console.log(`[Products] 📬 Response status=${response.status} TTFB=${ttfbMs}ms`);

      if (!response.ok) throw new Error(`Products API returned ${response.status}`);

      const parseStart = performance.now();
      const data = await response.json();
      const parseMs = Math.round(performance.now() - parseStart);

      // Payload pagination meta
      const fetched: Product[] = data.docs || [];
      const serverTotalDocs: number = data.totalDocs ?? fetched.length;
      const serverTotalPages: number = data.totalPages ?? Math.ceil(serverTotalDocs / PRODUCTS_PER_PAGE);

      const active = fetched.filter((p) => p.status?.toLowerCase() !== "draft");

      console.log(`[Products] 📦 JSON parse=${parseMs}ms | fetched=${fetched.length} active=${active.length} | totalDocs=${serverTotalDocs} totalPages=${serverTotalPages}`);
      console.log(`[Products] 🔍 Timing: TTFB=${ttfbMs}ms | parse=${parseMs}ms | total=${ttfbMs + parseMs}ms`);

      if (active.length > 0) {
        const s = active[0];
        console.log(`[Products] 🧪 Sample[0]: id=${s.id} name="${s.name}" printT=${JSON.stringify(s.printT?.map(t => t.technologyName))} images=${s.displayImages?.length} colors=${s.colorOptions?.length}`);
      }

      active.forEach((p) => getOrCreateMetadata(p.id));

      // Store in per-page cache
      pageCache[page] = { data: active, ts: Date.now() };

      setProducts(active);
      setTotalDocs(serverTotalDocs);
      setTotalPages(serverTotalPages);

      const totalFetchMs = Math.round(performance.now() - fetchStart);
      const totalSinceMountMs = Math.round(performance.now() - mountTime.current);
      console.log(`%c[Products] ✅ Page ${page} rendered — fetch=${totalFetchMs}ms | since mount=${totalSinceMountMs}ms`, "color: green; font-weight: bold");

      if (ttfbMs > 3000) console.warn(`[Products] 🔴 SLOW TTFB (${ttfbMs}ms) — Payload/DB bottleneck`);
      if (parseMs > 500)  console.warn(`[Products] 🔴 SLOW PARSE (${parseMs}ms) — response still large`);
      if (totalSinceMountMs > 5000) console.warn(`[Products] 🔴 SLOW TOTAL (${totalSinceMountMs}ms)`);

    } catch (error) {
      const errMs = Math.round(performance.now() - fetchStart);
      console.error(`[Products] ❌ fetchProducts page=${page} failed after ${errMs}ms:`, error);
      toast({ title: "Failed to load products", description: "Please refresh the page.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ── Page change: clear current products, show skeleton, fetch next page
  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    console.log(`[Products] 📄 Page change: ${currentPage} → ${page}`);
    setCurrentPage(page);
    setProducts([]);
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Pagination buttons
  const renderPaginationButtons = () => {
    const buttons: React.ReactNode[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    const btn = (
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

  // Page range for "Showing X–Y of Z"
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * PRODUCTS_PER_PAGE, totalDocs);

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
            {!loading && totalDocs > 0 && (
              <p className="mt-4 text-sm text-gray-500">
                Showing {startIndex}–{endIndex} of {totalDocs} products
              </p>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.length > 0 ? (
                  products.map((product) => (
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