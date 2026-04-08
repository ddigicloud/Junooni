"use client"
import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Plus, Trash2, Save, Loader2, ArrowLeft, GripVertical,
  Eye, EyeOff, Image as ImageIcon, Search, X, Package,
  ChevronUp, ChevronDown, Edit2, Check,
} from "lucide-react"
import { ProfileDropdown } from "@/components/profile-dropdown"
import AdminImpersonationBanner from "@/components/AdminImpersonationBanner"

const BRAND = { primary: "#e65100", secondary: "#ac1900" }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

interface VendorCollection {
  id: string
  title: string
  handle: string
  description: string
  thumbnail: string | null
  product_ids: string[]
  sort_order: number
  is_visible: boolean
  created_at: string
}

interface MedusaProduct {
  id: string
  title: string
  thumbnail: string | null
  handle: string
  status: string
}

export default function CollectionsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [collections, setCollections] = useState<VendorCollection[]>([])
  const [products, setProducts] = useState<MedusaProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasStore, setHasStore] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [isUploadingThumb, setIsUploadingThumb] = useState(false)

  const token = localStorage.getItem("vendorToken")
  const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL

  // Load store + products
  useEffect(() => {
    const load = async () => {
      if (!token) { navigate({ to: "/sign-in" }); return }
      try {
        // Load store collections
        const sRes = await fetch(`${backendUrl}/vendors/me/store`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (sRes.ok) {
          const sd = await sRes.json()
          if (sd.store) {
            setCollections(sd.store.collections?.collections ?? [])
            setHasStore(true)
          }
        }
        // Load vendor products
        const pRes = await fetch(`${backendUrl}/vendors/products?limit=100&status=published`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (pRes.ok) {
          const pd = await pRes.json()
          setProducts(pd.products ?? [])
        }
      } catch (e) { console.error(e) }
      finally { setIsLoading(false) }
    }
    load()
  }, [])

  const save = async (cols: VendorCollection[]) => {
    setIsSaving(true)
    try {
      const res = await fetch(`${backendUrl}/vendors/me/store`, {
        method: hasStore ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ collections: { collections: cols } }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      setCollections(cols)
      setHasStore(true)
      toast({ title: "Saved!", description: "Collections updated." })
    } catch (e) {
      toast({ title: "Save failed", description: String(e), variant: "destructive" })
    } finally { setIsSaving(false) }
  }

  const addCollection = () => {
    const nc: VendorCollection = {
      id: `col_${Date.now()}`,
      title: "New Collection",
      handle: `new-collection-${Date.now()}`,
      description: "",
      thumbnail: null,
      product_ids: [],
      sort_order: collections.length,
      is_visible: true,
      created_at: new Date().toISOString(),
    }
    const updated = [...collections, nc]
    setCollections(updated)
    setEditingId(nc.id)
  }

  const updateCollection = (id: string, patch: Partial<VendorCollection>) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  }

  const deleteCollection = (id: string) => {
    const updated = collections.filter(c => c.id !== id)
    setCollections(updated)
    if (editingId === id) setEditingId(null)
    save(updated)
  }

  const moveCollection = (id: string, dir: "up" | "down") => {
    const arr = [...collections]
    const i = arr.findIndex(c => c.id === id)
    const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    setCollections(arr)
  }

  const toggleProduct = (colId: string, productId: string) => {
    const col = collections.find(c => c.id === colId)
    if (!col) return
    const has = col.product_ids.includes(productId)
    updateCollection(colId, {
      product_ids: has
        ? col.product_ids.filter(id => id !== productId)
        : [...col.product_ids, productId],
    })
  }

  const uploadThumbnail = async (colId: string, file: File) => {
    setIsUploadingThumb(true)
    try {
      const fd = new FormData(); fd.append("files", file)
      const res = await fetch(`${backendUrl}/vendors/uploads`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      const url = data.files?.[0]?.url
      if (url) updateCollection(colId, { thumbnail: url })
    } catch (e) {
      toast({ title: "Upload failed", description: String(e), variant: "destructive" })
    } finally { setIsUploadingThumb(false) }
  }

  const editingCol = editingId ? collections.find(c => c.id === editingId) : null
  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  )

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminImpersonationBanner />

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container flex items-center justify-between px-4 py-3 mx-auto">
          <div className="flex items-center gap-3">
            <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
            <Separator orientation="vertical" className="h-6" />
            <Link to="/store" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />My Store
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-semibold text-gray-800">My Collections</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={addCollection} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />New collection
            </Button>
            <Button size="sm" onClick={() => save(collections)} disabled={isSaving}
              className="gap-1.5"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: "white" }}>
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save all
            </Button>
            <ProfileDropdown />
          </div>
        </div>
      </div>

      <div className="container max-w-6xl px-4 py-8 mx-auto">
        {/* Intro */}
        <div className="mb-6">
          <h1 className="mb-1 text-xl font-bold text-gray-900">My Collections</h1>
          <p className="text-sm text-gray-500">
            Create custom collections for your store. These are separate from marketplace collections
            and let you group your products any way you like.
          </p>
        </div>

        <div className="flex gap-6">
          {/* LEFT: collection list */}
          <div className="space-y-3 w-80 shrink-0">
            {collections.length === 0 && (
              <div className="py-12 text-center bg-white border-2 border-gray-200 border-dashed rounded-2xl">
                <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="mb-1 text-sm font-medium text-gray-500">No collections yet</p>
                <p className="mb-4 text-xs text-gray-400">Create your first collection to group your products</p>
                <Button size="sm" onClick={addCollection} className="gap-1.5"
                  style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: "white" }}>
                  <Plus className="w-3.5 h-3.5" />Create collection
                </Button>
              </div>
            )}
            {collections.map((col, idx) => (
              <div
                key={col.id}
                onClick={() => setEditingId(col.id === editingId ? null : col.id)}
                className={`group relative bg-white rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${
                  editingId === col.id ? "shadow-md" : "border-gray-100"
                }`}
                style={editingId === col.id ? { borderColor: BRAND.primary } : {}}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Thumbnail */}
                  <div className="overflow-hidden bg-gray-100 border border-gray-200 w-14 h-14 rounded-xl shrink-0">
                    {col.thumbnail
                      ? <img src={col.thumbnail} alt={col.title} className="object-cover w-full h-full" />
                      : <div className="flex items-center justify-center w-full h-full">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{col.title}</p>
                    <p className="font-mono text-xs text-gray-400 truncate">/collections/{col.handle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{col.product_ids.length} products</span>
                      {!col.is_visible && (
                        <Badge className="text-[10px] bg-gray-100 text-gray-500 border-gray-200 py-0">Hidden</Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); moveCollection(col.id, "up") }}
                      disabled={idx === 0}
                      className="p-1 transition-colors rounded hover:bg-gray-100 disabled:opacity-30">
                      <ChevronUp className="w-3 h-3 text-gray-500" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); moveCollection(col.id, "down") }}
                      disabled={idx === collections.length - 1}
                      className="p-1 transition-colors rounded hover:bg-gray-100 disabled:opacity-30">
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteCollection(col.id) }}
                      className="p-1 transition-colors rounded hover:bg-red-50">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: editor */}
          {editingCol ? (
            <div className="flex-1 space-y-5">
              {/* Basic info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Collection details</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCollection(editingCol.id, { is_visible: !editingCol.is_visible })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          editingCol.is_visible
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-50 text-gray-500"
                        }`}
                      >
                        {editingCol.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {editingCol.is_visible ? "Visible" : "Hidden"}
                      </button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Title</label>
                      <Input
                        value={editingCol.title}
                        onChange={e => {
                          const title = e.target.value
                          updateCollection(editingCol.id, {
                            title,
                            handle: slugify(title),
                          })
                        }}
                        placeholder="e.g. Summer Drops"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">URL handle</label>
                      <div className="flex items-center">
                        <div className="px-2 py-2 text-xs text-gray-400 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg whitespace-nowrap">
                          /collections/
                        </div>
                        <Input
                          value={editingCol.handle}
                          onChange={e => updateCollection(editingCol.id, { handle: slugify(e.target.value) })}
                          className="font-mono text-sm rounded-l-none"
                          placeholder="summer-drops"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                    <Textarea
                      value={editingCol.description}
                      onChange={e => updateCollection(editingCol.id, { description: e.target.value })}
                      placeholder="Describe this collection..."
                      rows={2}
                    />
                  </div>

                  {/* Thumbnail */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Cover image</label>
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center justify-center w-24 h-24 overflow-hidden transition-colors border-2 border-gray-200 border-dashed cursor-pointer rounded-xl bg-gray-50 hover:border-gray-400 shrink-0"
                      >
                        {editingCol.thumbnail
                          ? <img src={editingCol.thumbnail} alt="thumb" className="object-cover w-full h-full" />
                          : <div className="p-2 text-center">
                              <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                              <p className="text-[10px] text-gray-400">Click to upload</p>
                            </div>
                        }
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => fileRef.current?.click()}
                          disabled={isUploadingThumb}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50"
                        >
                          {isUploadingThumb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                          {editingCol.thumbnail ? "Change image" : "Upload image"}
                        </button>
                        {editingCol.thumbnail && (
                          <button
                            onClick={() => updateCollection(editingCol.id, { thumbnail: null })}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />Remove
                          </button>
                        )}
                        <p className="text-xs text-gray-400">Recommended: 800×600px or wider</p>
                      </div>
                    </div>
                    <input
                      ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && uploadThumbnail(editingCol.id, e.target.files[0])}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Product picker */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Products</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {editingCol.product_ids.length} of {products.length} products selected
                      </CardDescription>
                    </div>
                    {editingCol.product_ids.length > 0 && (
                      <button
                        onClick={() => updateCollection(editingCol.id, { product_ids: [] })}
                        className="text-xs text-red-400 transition-colors hover:text-red-600"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Search products..."
                      className="w-full py-2 pr-3 text-sm transition-colors border border-gray-200 rounded-lg pl-9 focus:outline-none focus:border-gray-400"
                    />
                    {productSearch && (
                      <button onClick={() => setProductSearch("")} className="absolute -translate-y-1/2 right-3 top-1/2">
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                  </div>

                  {/* Product grid */}
                  <div className="pr-1 space-y-2 overflow-y-auto max-h-96">
                    {filteredProducts.length === 0 && (
                      <p className="py-6 text-sm text-center text-gray-400">No products found</p>
                    )}
                    {filteredProducts.map(product => {
                      const selected = editingCol.product_ids.includes(product.id)
                      return (
                        <div
                          key={product.id}
                          onClick={() => toggleProduct(editingCol.id, product.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selected
                              ? "border-orange-200 bg-orange-50"
                              : "border-gray-100 hover:border-gray-200 bg-white"
                          }`}
                        >
                          <div className="w-10 h-10 overflow-hidden bg-gray-100 border border-gray-200 rounded-lg shrink-0">
                            {product.thumbnail
                              ? <img src={product.thumbnail} alt={product.title} className="object-cover w-full h-full" />
                              : <div className="flex items-center justify-center w-full h-full">
                                  <Package className="w-4 h-4 text-gray-300" />
                                </div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                            <p className="font-mono text-xs text-gray-400 truncate">/{product.handle}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            selected ? "border-transparent" : "border-gray-300"
                          }`}
                            style={selected ? { background: BRAND.primary } : {}}>
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Save this collection */}
              <div className="flex justify-end">
                <Button
                  onClick={() => save(collections)}
                  disabled={isSaving}
                  className="gap-2 px-8"
                  style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`, color: "white" }}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save collections
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 py-20">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl"
                  style={{ background: `${BRAND.primary}15` }}>
                  <Edit2 className="w-7 h-7" style={{ color: BRAND.primary }} />
                </div>
                <p className="mb-1 text-sm font-medium text-gray-600">Select a collection to edit</p>
                <p className="text-xs text-gray-400">Or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}