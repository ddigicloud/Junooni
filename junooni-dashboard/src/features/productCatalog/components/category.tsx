import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, X, ArrowLeft, Filter, Grid, Search } from 'lucide-react';
import Navbar from './Navbar';
import { useParams } from '@tanstack/react-router';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import { Link } from '@tanstack/react-router';

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// ─── Module-level memory cache (zero JSON.parse overhead) ────────────────────
const CACHE_TTL = 10 * 60 * 1000; // 10 min

interface MemCache<T> { data: T; ts: number }

const memCache = new Map<string, MemCache<unknown>>();

function mcGet<T>(key: string): T | null {
  const entry = memCache.get(key) as MemCache<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { memCache.delete(key); return null; }
  return entry.data;
}

function mcSet<T>(key: string, data: T): void {
  memCache.set(key, { data, ts: Date.now() });
}

// Plain product store for ProductPage handoff (no TTL wrapper)
function storeProductPlain(productId: number | string, data: unknown) {
  try { sessionStorage.setItem(`product_${productId}`, JSON.stringify(data)); } catch {}
}

// ─── Rich-text helpers ────────────────────────────────────────────────────────
const extractText = (children: any[]): string =>
  children.reduce((acc: string, child: any) => {
    if (child.type === 'text') return acc + child.text;
    if (child.children) return acc + extractText(child.children);
    return acc;
  }, '');

const parseRichTextContent = (description: any): { heading: string; subheading: string } => {
  const fallback = {
    heading: 'Products',
    subheading: 'Discover our curated collection of premium products designed to meet your needs.',
  };
  if (!description?.root?.children) return fallback;
  let heading = fallback.heading;
  let subheading = fallback.subheading;
  for (const child of description.root.children) {
    if (child.type === 'heading' && child.tag === 'h1' && child.children)
      heading = extractText(child.children);
    else if (child.type === 'paragraph' && child.children)
      subheading = extractText(child.children);
  }
  return { heading, subheading };
};

// ─── Types ────────────────────────────────────────────────────────────────────
type SimplifiedProduct = {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  availableColors?: string[];
  category: string[];
  isNew?: boolean;
  onSale?: boolean;
  description?: string;
  colorOptions?: ColorOption[];
  sizeOptions?: SizeOption[];
  printingTechnologies?: PrintingTechnology[];
};

interface Image { id: number; alt: string; url: string; width: number; height: number; thumbnailURL?: string | null; }
interface DisplayImage { id: string; title: string | null; image: Image; caption: string | null; }
interface ColorOption { id: string; colorName: string; colorHex: string; }
interface SizeOption { id: string; sizeName: string; sizeDescription: string | null; }
interface PrintingTechnology { id: string; technologyName: string; customizationAreas: any[]; mockupPhotos: any[]; }
interface Dimensions { x: number; y: number; customizableWidth: number; customizableHeight: number; }
interface ShippingInfo { weight: number; dimensions: string; }
interface Breadcrumb { id: string; doc: number; url: string; label: string; }

interface Category {
  id: number;
  title: string;
  description?: any;
  slug: string;
  parent: Category | null;
  breadcrumbs: Breadcrumb[];
  updatedAt: string;
  createdAt: string;
  products?: APIProduct[];
}

interface APIProduct {
  id: number;
  name: string;
  cost: number;
  sku: string;
  brand: string;
  Brandsku: string | null;
  dimensions: Dimensions;
  categories: Category[];
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
  sizeChart: any | null;
  description: string;
  features: any | null;
  displayImages: DisplayImage[];
  mockupImages: any[];
  shippingInfo: ShippingInfo | null;
  printingTechnologies: PrintingTechnology[];
  updatedAt?: string;
  createdAt?: string;
}

interface Product {
  id: number; name: string; cost: number; sku: string; brand: string; Brandsku: string | null;
  dimensions: Dimensions; categories: Category[]; colorOptions: ColorOption[]; sizeOptions: SizeOption[];
  sizeChart: any | null; description: string | null; features: any | null; displayImages: DisplayImage[];
  mockupImages: any[]; shippingInfo: ShippingInfo; printingTechnologies: PrintingTechnology[];
  updatedAt: string; createdAt: string;
}

// ─── Utility ──────────────────────────────────────────────────────────────────
const isLightColor = (hex: string): boolean => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
};

// ─── Styles (injected once) ───────────────────────────────────────────────────
const useStyles = () => {
  useEffect(() => {
    if (document.getElementById('cat-page-styles')) return;
    const style = document.createElement('style');
    style.id = 'cat-page-styles';
    style.innerHTML = `
      @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
      .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      .filter-section { transition: all 0.2s ease-out; }
      .filter-section:hover { background-color: #fef7f0; }
      .category-pill { transition: all 0.2s ease-out; background: linear-gradient(135deg,#ffffff 0%,#f8f9fa 100%); border: 1px solid #e2e8f0; }
      .category-pill:hover { background: linear-gradient(135deg,#e65100 0%,#ff6f00 100%); border-color: #e65100; color: white; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(230,81,0,.15); }
      .category-pill.active { background: linear-gradient(135deg,#e65100 0%,#ff6f00 100%); border-color: #e65100; color: white; box-shadow: 0 2px 8px rgba(230,81,0,.2); }
      .filter-badge { background: linear-gradient(135deg,#e65100 0%,#ff6f00 100%); color: white; border: none; }
      .product-grid { opacity: 0; animation: fadeIn 0.6s ease-out 0.1s forwards; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById('cat-page-styles')?.remove(); };
  }, []);
};

// ─── API helpers ──────────────────────────────────────────────────────────────
async function fetchCategoryList(): Promise<Category[]> {
  const key = 'cat_list_v2';
  const cached = mcGet<Category[]>(key);
  if (cached) return cached;
  const res = await fetch(`${vite_payload}/api/categories?limit=100&depth=1`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  mcSet(key, data.docs);
  return data.docs;
}

// KEY FIX: depth=2 on a single category returns `products` embedded.
// BUT PayloadCMS `depth=2` means: category → products → their relations (images, colors etc).
// That's 3 levels of nesting per product × N products = huge response.
// FIX: Fetch category at depth=1 (just get the product IDs list),
// then fetch those products separately with depth=1 in one batched call.
async function fetchCategoryBySlug(slug: string): Promise<{ category: Category; products: APIProduct[] }> {
  const key = `cat_${slug}_v3`;
  const cached = mcGet<{ category: Category; products: APIProduct[] }>(key);
  if (cached) return cached;

  // Step 1: fetch category metadata only (depth=1 gives us product id list without full nesting)
  const catRes = await fetch(
    `${vite_payload}/api/categories?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=1`,
    { credentials: 'include' }
  );
  if (!catRes.ok) throw new Error('Failed to fetch category');
  const catData = await catRes.json();
  const cat: Category = catData.docs?.[0] ?? null;

  if (!cat) return { category: cat, products: [] };

  // Step 2: if category has product IDs, fetch them in ONE batched request at depth=1
  // This avoids the depth=2 explosion: instead of one huge nested response,
  // we get a flat list of fully-hydrated products.
  const productIds: number[] = (cat.products ?? []).map((p: any) =>
    typeof p === 'object' ? p.id : p
  );

  let products: APIProduct[] = [];

  if (productIds.length > 0) {
    // Build OR query: where[id][in]=1,2,3,...
    const idList = productIds.join(',');
    const prodRes = await fetch(
      `${vite_payload}/api/blank-products?where[id][in]=${idList}&where[status][equals]=active&limit=200&depth=1`,
      { credentials: 'include' }
    );
    if (prodRes.ok) {
      const prodData = await prodRes.json();
      products = (prodData.docs ?? []).sort((a: APIProduct, b: APIProduct) => b.id - a.id);
    }
  }

  const result = { category: cat, products };
  mcSet(key, result);
  return result;
}

function toSimplified(p: APIProduct): SimplifiedProduct {
  return {
    id: String(p.id),
    name: p.name,
    price: p.cost,
    rating: 4.5,
    image: p.displayImages?.[0]?.image?.url ?? '/placeholder-image.jpg',
    category: p.categories.map(c => c.slug),
    availableColors: p.colorOptions?.map(c => c.colorHex) ?? [],
    colorOptions: p.colorOptions ?? [],
    sizeOptions: p.sizeOptions ?? [],
    printingTechnologies: p.printingTechnologies ?? [],
    description: p.description,
    isNew: false,
    onSale: false,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const MobileFilterOverlay: React.FC<{
  isOpen: boolean; onClose: () => void; onReset: () => void; children: React.ReactNode;
}> = ({ isOpen, onClose, onReset, children }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handler = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => { document.removeEventListener('mousedown', handler); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div ref={overlayRef} className="w-full h-full overflow-y-auto bg-white shadow-2xl animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center">
            <button onClick={onClose} className="mr-3 text-gray-600 hover:text-[#e65100] transition-colors p-1 rounded-lg hover:bg-orange-100">
              <ArrowLeft size={20} />
            </button>
            <h3 className="text-xl font-semibold text-gray-900">Filters</h3>
          </div>
          <button onClick={() => { onClose(); setTimeout(onReset, 100); }} className="text-sm font-medium text-[#e65100] hover:text-orange-700 transition-colors px-3 py-1 rounded-lg hover:bg-orange-100">
            Reset all
          </button>
        </div>
        <div className="p-6">{children}</div>
        <div className="sticky bottom-0 p-6 bg-white border-t bg-gray-50">
          <Button onClick={onClose} className="w-full bg-gradient-to-r from-[#e65100] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 rounded-xl">
            Show results
          </Button>
        </div>
      </div>
    </div>
  );
};

const FilterSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({
  title, children, defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsOpen(mq.matches || defaultOpen);
    const h = (e: MediaQueryListEvent) => { if (e.matches) setIsOpen(true); };
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [defaultOpen]);

  return (
    <div className="p-4 mb-6 border border-gray-100 filter-section rounded-xl">
      <button onClick={() => setIsOpen(v => !v)} className="flex items-center justify-between w-full py-2 text-left font-semibold text-gray-900 md:cursor-default hover:text-[#e65100] transition-colors">
        {title}
        <span className="md:hidden">
          {isOpen ? <ChevronDown size={16} className="text-[#e65100]" /> : <ChevronRight size={16} className="text-[#e65100]" />}
        </span>
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

const ColorFilter: React.FC<{ colors: ColorOption[]; selectedColors: string[]; onChange: (v: string[]) => void }> = ({
  colors, selectedColors, onChange,
}) => {
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 12;
  const unique = useMemo(() => colors.filter((c, i, arr) => arr.findIndex(x => x.colorHex === c.colorHex) === i), [colors]);
  const displayed = showAll ? unique : unique.slice(0, LIMIT);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {displayed.map((color) => {
          const selected = selectedColors.includes(color.colorHex);
          return (
            <button key={color.colorHex} type="button" title={color.colorName}
              onClick={() => onChange(selected ? selectedColors.filter(h => h !== color.colorHex) : [...selectedColors, color.colorHex])}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${selected ? 'ring-3 ring-[#e65100] ring-offset-2 shadow-lg' : 'ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-300'} ${color.colorHex.toLowerCase() === '#ffffff' || color.colorHex.toLowerCase() === '#fff' ? 'border border-gray-200' : ''}`}
              style={{ backgroundColor: color.colorHex }}
            >
              {selected && <span className={`text-sm font-bold ${isLightColor(color.colorHex) ? 'text-black' : 'text-white'}`}>✓</span>}
            </button>
          );
        })}
      </div>
      {unique.length > LIMIT && (
        <button onClick={() => setShowAll(v => !v)} className="mt-4 text-sm font-medium text-[#e65100] hover:text-orange-700 transition-colors flex items-center gap-1">
          {showAll ? <><span>Show less</span><ChevronRight size={16} className="rotate-[-90deg]" /></> : <><span>Show more ({unique.length - LIMIT} more)</span><ChevronRight size={16} className="rotate-90" /></>}
        </button>
      )}
    </div>
  );
};

const CheckboxFilter: React.FC<{
  items: any[]; selectedItems: string[]; onChange: (v: string[]) => void; nameKey?: string; valueKey?: string;
}> = ({ items, selectedItems, onChange, nameKey = 'name', valueKey }) => {
  const unique = useMemo(() =>
    valueKey ? items.filter((item, i, arr) => arr.findIndex(x => x[valueKey] === item[valueKey]) === i) : items,
    [items, valueKey]
  );
  return (
    <div className="space-y-3">
      {unique.map((item) => {
        const value = (valueKey && item[valueKey]) ? item[valueKey] : item.id;
        const selected = selectedItems.includes(value);
        return (
          <label key={value} className="flex items-center p-2 space-x-3 transition-colors rounded-lg cursor-pointer group hover:bg-orange-50">
            <Checkbox checked={selected}
              onCheckedChange={(checked) => onChange(checked ? [...selectedItems, value] : selectedItems.filter(v => v !== value))}
              className="data-[state=checked]:bg-[#e65100] data-[state=checked]:border-[#e65100]"
            />
            <span className={`text-sm transition-colors ${selected ? 'text-[#e65100] font-medium' : 'text-gray-700 group-hover:text-[#e65100]'}`}>
              {item[nameKey]}
            </span>
          </label>
        );
      })}
    </div>
  );
};

const CategoryTree: React.FC<{
  categories: Category[]; currentCategoryId?: number | null; onSelectCategory: (slug: string) => void;
}> = React.memo(({ categories, currentCategoryId, onSelectCategory }) => {
  const parents = useMemo(() => categories.filter(c => !c.parent), [categories]);

  const renderCategory = useCallback((cat: Category): React.ReactNode => {
    const children = categories.filter(c => c.parent?.id === cat.id);
    const isActive = cat.id === currentCategoryId;
    return (
      <div key={cat.id} className="ml-2">
        <button onClick={() => onSelectCategory(cat.slug)}
          className={`text-left hover:text-[#e65100] text-sm py-2 px-3 rounded-lg transition-all duration-200 ${isActive ? 'font-semibold text-[#e65100] bg-orange-50' : 'text-gray-700 hover:bg-orange-50'}`}>
          {cat.title}
        </button>
        {children.length > 0 && (
          <div className="pl-4 ml-2 border-l-2 border-orange-100">{children.map(renderCategory)}</div>
        )}
      </div>
    );
  }, [categories, currentCategoryId, onSelectCategory]);

  return <div className="space-y-1">{parents.map(renderCategory)}</div>;
});
CategoryTree.displayName = 'CategoryTree';

// ─── Main component ───────────────────────────────────────────────────────────
const CategoryPage: React.FC = () => {
  useStyles();

  const [simplifiedProducts, setSimplifiedProducts] = useState<SimplifiedProduct[]>([]);
  const [apiProducts, setApiProducts] = useState<APIProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingNav, setLoadingNav] = useState(true);

  const [selectedColorHexes, setSelectedColorHexes] = useState<string[]>([]);
  const [selectedSizeNames, setSelectedSizeNames] = useState<string[]>([]);
  const [selectedTechnologyNames, setSelectedTechnologyNames] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [activeFilterOverlay, setActiveFilterOverlay] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 768);

  const fetchStarted = useRef(false);

  const params = useParams({ strict: false });
  const slug = params.slug as string;

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Derive slug once — no useMemo needed, just read on mount
  const targetSlug = useMemo(() => {
    if (slug) return slug;
    const parts = window.location.pathname.split('/');
    const idx = parts.indexOf('category');
    return parts.slice(idx + 1).filter(Boolean).at(-1) ?? '';
  }, [slug]);

  useEffect(() => {
    if (!targetSlug || fetchStarted.current) return;
    fetchStarted.current = true;

    // Nav list and products fire IN PARALLEL
    const navPromise = fetchCategoryList()
      .then(docs => { setCategories(docs); setLoadingNav(false); })
      .catch(() => setLoadingNav(false));

    const productsPromise = fetchCategoryBySlug(targetSlug)
      .then(({ category, products }) => {
        setCurrentCategory(category);
        setApiProducts(products);
        setSimplifiedProducts(products.map(toSimplified));
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));

    // Don't await — fire and forget, state updates trigger renders
    void Promise.all([navPromise, productsPromise]);
  }, [targetSlug]);

  // ── Derived filter options (memoized off apiProducts) ──────────────────────
  const { availableColors, availableSizes, availableTechnologies } = useMemo(() => {
    const colorMap = new Map<string, ColorOption>();
    const sizeMap = new Map<string, SizeOption>();
    const techMap = new Map<string, PrintingTechnology>();
    for (const p of apiProducts) {
      p.colorOptions?.forEach(c => { if (!colorMap.has(c.id)) colorMap.set(c.id, c); });
      p.sizeOptions?.forEach(s => { if (!sizeMap.has(s.id)) sizeMap.set(s.id, s); });
      p.printingTechnologies?.forEach(t => { if (!techMap.has(t.id)) techMap.set(t.id, t); });
    }
    return {
      availableColors: [...colorMap.values()],
      availableSizes: [...sizeMap.values()],
      availableTechnologies: [...techMap.values()],
    };
  }, [apiProducts]);

  // ── Filtered products ──────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let r = simplifiedProducts;
    if (selectedColorHexes.length) r = r.filter(p => p.colorOptions?.some(c => selectedColorHexes.includes(c.colorHex)));
    if (selectedSizeNames.length) r = r.filter(p => p.sizeOptions?.some(s => selectedSizeNames.includes(s.sizeName)));
    if (selectedTechnologyNames.length) r = r.filter(p => p.printingTechnologies?.some(t => selectedTechnologyNames.includes(t.technologyName)));
    if (selectedCategories.length) r = r.filter(p => p.category?.some(c => selectedCategories.includes(c)));
    return r;
  }, [simplifiedProducts, selectedColorHexes, selectedSizeNames, selectedTechnologyNames, selectedCategories]);

  // ── Build a fast id→product lookup map (avoids .find() loop per card) ──────
  const productMap = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of apiProducts) {
      m.set(String(p.id), {
        id: p.id, name: p.name, cost: p.cost, sku: p.sku, brand: p.brand, Brandsku: p.Brandsku,
        dimensions: p.dimensions, categories: p.categories, colorOptions: p.colorOptions ?? [],
        sizeOptions: p.sizeOptions ?? [], sizeChart: p.sizeChart, description: p.description,
        features: p.features, displayImages: p.displayImages ?? [], mockupImages: p.mockupImages ?? [],
        shippingInfo: p.shippingInfo ?? { weight: 0, dimensions: '0x0' },
        printingTechnologies: p.printingTechnologies ?? [],
        updatedAt: p.updatedAt ?? new Date().toISOString(),
        createdAt: p.createdAt ?? new Date().toISOString(),
      });
    }
    return m;
  }, [apiProducts]);

  const storeProduct = useCallback((productId: string) => {
    const raw = apiProducts.find(x => x.id === parseInt(productId));
    if (raw) storeProductPlain(raw.id, raw);
  }, [apiProducts]);

  const clearAllFilters = useCallback(() => {
    setSelectedColorHexes([]); setSelectedSizeNames([]);
    setSelectedTechnologyNames([]); setSelectedCategories([]);
  }, []);

  const totalFilters = selectedColorHexes.length + selectedSizeNames.length + selectedTechnologyNames.length + selectedCategories.length;

  const heroContent = useMemo(() =>
    currentCategory?.description
      ? parseRichTextContent(currentCategory.description)
      : { heading: 'Products', subheading: 'Discover our curated collection of premium products designed to meet your needs.' },
    [currentCategory]
  );

  const filterPanel = (
    <>
      {availableColors.length > 0 && (
        <FilterSection title="Colors" defaultOpen>
          <ColorFilter colors={availableColors} selectedColors={selectedColorHexes} onChange={setSelectedColorHexes} />
        </FilterSection>
      )}
      {availableSizes.length > 0 && (
        <FilterSection title="Sizes">
          <CheckboxFilter items={availableSizes} selectedItems={selectedSizeNames} onChange={setSelectedSizeNames} nameKey="sizeName" valueKey="sizeName" />
        </FilterSection>
      )}
      {availableTechnologies.length > 0 && (
        <FilterSection title="Printing Technologies">
          <CheckboxFilter items={availableTechnologies} selectedItems={selectedTechnologyNames} onChange={setSelectedTechnologyNames} nameKey="technologyName" valueKey="technologyName" />
        </FilterSection>
      )}
    </>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30">
        <div className="container px-4 py-8 mx-auto mt-12">

          <div className="mb-4 sm:mt-12 animate-fadeIn">
            <h1 className="mb-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#e65100] to-orange-600 bg-clip-text text-transparent">
              {heroContent.heading}
            </h1>
            <p className="max-w-2xl text-lg text-gray-600">{heroContent.subheading}</p>
          </div>

          {!loadingNav && (
            <div className="flex gap-3 pb-2 mb-6 overflow-x-auto md:hidden flex-nowrap">
              {categories.map(item => (
                <div key={item.id} className={`category-pill rounded-full px-6 py-3 whitespace-nowrap text-sm font-medium cursor-pointer ${currentCategory?.slug === item.slug ? 'active' : ''}`}>
                  <Link to={`/productCatalog/category/${item.slug}`}>{item.title}</Link>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between p-4 mb-6 bg-white border border-orange-100 shadow-sm md:hidden rounded-xl">
            <div className="text-sm font-medium text-gray-700">
              <span className="text-[#e65100] font-semibold">{filteredProducts.length}</span> products found
            </div>
            {isMobileView && (
              <Button variant="outline" size="sm"
                className="flex items-center gap-2 border-[#e65100] text-[#e65100] hover:bg-[#e65100] hover:text-white transition-all duration-200"
                onClick={() => setActiveFilterOverlay('all')}
              >
                <Filter size={16} /><span>Filters</span>
                {totalFilters > 0 && <Badge className="h-5 px-1 ml-1 min-w-5 filter-badge">{totalFilters}</Badge>}
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-8 md:flex-row">
            {/* Desktop sidebar */}
            <div className="flex-shrink-0 hidden w-full md:w-80 md:block">
              {loadingProducts ? (
                <div className="h-96 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
              ) : (
                <>
                  <div className="p-6 mb-8 bg-white border border-orange-100 shadow-sm rounded-xl">
                    <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900">
                      <div className="w-2 h-6 bg-gradient-to-b from-[#e65100] to-orange-600 rounded-full" />
                      Categories
                    </h3>
                    <CategoryTree categories={categories} currentCategoryId={currentCategory?.id}
                      onSelectCategory={s => { window.location.href = `/productCatalog/category/${s}`; }} />
                  </div>

                  {totalFilters > 0 && (
                    <div className="p-6 mb-6 bg-white border border-orange-100 shadow-sm rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <div className="w-2 h-6 bg-gradient-to-b from-[#e65100] to-orange-600 rounded-full" />
                          Active Filters
                        </h3>
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-sm text-[#e65100] hover:text-orange-700 hover:bg-orange-50">
                          Clear All
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedColorHexes.map(hex => {
                          const c = availableColors.find(x => x.colorHex === hex);
                          return c ? (
                            <Badge key={`color-${hex}`} className="flex items-center gap-2 py-1 pl-2 pr-1 filter-badge">
                              <span className="w-3 h-3 border rounded-full border-white/30" style={{ backgroundColor: hex }} />
                              {c.colorName}
                              <button onClick={() => setSelectedColorHexes(selectedColorHexes.filter(h => h !== hex))} className="p-1 ml-1 rounded-full hover:bg-white/20"><X size={12} /></button>
                            </Badge>
                          ) : null;
                        })}
                        {selectedSizeNames.map(name => (
                          <Badge key={`size-${name}`} className="flex items-center gap-1 py-1 pl-2 pr-1 filter-badge">
                            {name}
                            <button onClick={() => setSelectedSizeNames(selectedSizeNames.filter(n => n !== name))} className="p-1 ml-1 rounded-full hover:bg-white/20"><X size={12} /></button>
                          </Badge>
                        ))}
                        {selectedTechnologyNames.map(name => (
                          <Badge key={`tech-${name}`} className="flex items-center gap-1 py-1 pl-2 pr-1 filter-badge">
                            {name}
                            <button onClick={() => setSelectedTechnologyNames(selectedTechnologyNames.filter(n => n !== name))} className="p-1 ml-1 rounded-full hover:bg-white/20"><X size={12} /></button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {filterPanel}
                </>
              )}
            </div>

            {/* Mobile overlay */}
            {isMobileView && (
              <MobileFilterOverlay isOpen={activeFilterOverlay === 'all'} onClose={() => setActiveFilterOverlay(null)} onReset={clearAllFilters}>
                {availableColors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
                      <div className="w-2 h-5 bg-gradient-to-b from-[#e65100] to-orange-600 rounded-full" />Colors
                    </h3>
                    <ColorFilter colors={availableColors} selectedColors={selectedColorHexes} onChange={setSelectedColorHexes} />
                  </div>
                )}
                <Separator className="my-6" />
                {availableSizes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
                      <div className="w-2 h-5 bg-gradient-to-b from-[#e65100] to-orange-600 rounded-full" />Sizes
                    </h3>
                    <CheckboxFilter items={availableSizes} selectedItems={selectedSizeNames} onChange={setSelectedSizeNames} nameKey="sizeName" valueKey="sizeName" />
                  </div>
                )}
                {availableTechnologies.length > 0 && (
                  <div className="mb-8">
                    <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
                      <div className="w-2 h-5 bg-gradient-to-b from-[#e65100] to-orange-600 rounded-full" />Printing Technologies
                    </h3>
                    <CheckboxFilter items={availableTechnologies} selectedItems={selectedTechnologyNames} onChange={setSelectedTechnologyNames} nameKey="technologyName" valueKey="technologyName" />
                  </div>
                )}
              </MobileFilterOverlay>
            )}

            {/* Products grid */}
            <div className="flex-1">
              {loadingProducts ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : (
                <>
                  <div className="items-center justify-between hidden p-4 mb-4 bg-white border border-orange-100 shadow-sm md:flex rounded-xl">
                    <span className="text-sm text-gray-600">
                      Showing <span className="font-semibold text-[#e65100]">{filteredProducts.length}</span> products
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">View:</span>
                      <Button variant="outline" size="sm" className="p-2"><Grid size={16} /></Button>
                    </div>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-orange-100 shadow-sm rounded-xl animate-fadeIn">
                      <div className="max-w-md mx-auto">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
                          <Search className="w-8 h-8 text-[#e65100]" />
                        </div>
                        <h3 className="mb-3 text-xl font-semibold text-gray-900">No products found</h3>
                        <p className="mb-6 text-gray-600">We couldn't find products matching your filters. Try adjusting your criteria.</p>
                        <Button onClick={clearAllFilters} className="bg-gradient-to-r from-[#e65100] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 py-2 rounded-lg">
                          Clear all filters
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 product-grid sm:grid-cols-2 lg:grid-cols-3">
                      {filteredProducts.map((product, index) => {
                        const cardData = productMap.get(product.id);
                        if (!cardData) return null;
                        return (
                          <div key={product.id}
                            className="relative w-full max-w-full mx-auto group transform transition-all duration-300 hover:scale-[1.02]"
                            onClick={() => storeProduct(product.id)}
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <ProductCard product={cardData} metadata={{ isBestSeller: false, isStaffPick: false, rating: 4.5, reviewCount: 0 }} />
                            {product.isNew && <Badge className="absolute z-20 font-medium text-white top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600">New</Badge>}
                            {product.onSale && <Badge className="absolute z-20 font-medium text-white top-3 right-3 bg-gradient-to-r from-red-500 to-red-600">Sale</Badge>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;