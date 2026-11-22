import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { X, Upload, Trash2, Loader2, Images } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GalleryImage {
  id:         string
  url:        string
  filename:   string
  size:       number | null
  mime_type:  string | null
  created_at: string
}

interface GalleryPickerModalProps {
  isOpen:              boolean
  onClose:             () => void
  /** Pass the existing Canvas file-input trigger so the existing upload flow is untouched */
  onUploadFromDevice: () => void
  onImageUsed?: (base64: string, filename: string, url: string, fileSize?: number) => void
  onImageSelected?: (image: GalleryImage) => void
  addImageToCanvas: (...args: any[]) => any
  activeArea:          string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BRAND = '#e65100'

async function urlToBase64(url: string): Promise<string> {
  const BACKEND = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  const proxyUrl = url.startsWith(BACKEND)
    ? window.location.origin + url.slice(BACKEND.length)
    : url
  const res  = await fetch(proxyUrl)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader     = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror   = reject
    reader.readAsDataURL(blob)
  })
}

function authHeaders(): Record<string, string> {
  const token =
    localStorage.getItem('vendorToken') ||
    localStorage.getItem('_medusa_jwt')  ||
    ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Component ────────────────────────────────────────────────────────────────

const GalleryPickerModal: React.FC<GalleryPickerModalProps> = ({
  isOpen,
  onClose,
  onUploadFromDevice,
  addImageToCanvas,
  onImageSelected,
  onImageUsed,
  activeArea,
}) => {
  const [images,     setImages]     = useState<GalleryImage[]>([])
  const [loading,    setLoading]    = useState(false)
  const [hoveredId,  setHoveredId]  = useState<string | null>(null)
  const [usingId,    setUsingId]    = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<GalleryImage | null>(null)
  const [error,      setError]      = useState<string | null>(null)
  const [uploading,  setUploading]  = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Fetch gallery on open ────────────────────────────────────────────────

  const fetchGallery = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/gallery`, {
        headers: { ...authHeaders() },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const sorted = ((data.images ?? []) as GalleryImage[]).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setImages(sorted)
    } catch {
      setError('Could not load your gallery.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) fetchGallery()
  }, [isOpen, fetchGallery])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // ── Use image from gallery ───────────────────────────────────────────────

//   const handleUse = async (image: GalleryImage) => {
//     if (usingId) return
//     setUsingId(image.id)
//     try {
//       const base64 = await urlToBase64(image.url)
//       await addImageToCanvas(base64, image.filename, activeArea, base64)
//       onClose()
//     } catch (err) {
//       console.error('[GalleryPickerModal] Failed to add to canvas:', err)
//     } finally {
//       setUsingId(null)
//     }
//   }

const handleUse = async (image: GalleryImage) => {
  try {
    const base64 = await urlToBase64(image.url)
    addImageToCanvas(base64, image.filename, activeArea, base64)
    onImageUsed?.(base64, image.filename, image.url, image.size ?? undefined)
    onClose()
  } catch (err) {
    console.error('[GalleryPickerModal] Failed to add to canvas:', err)
  }
}

  // ── Delete from gallery ──────────────────────────────────────────────────

  const handleDelete = (e: React.MouseEvent, image: GalleryImage) => {
  e.stopPropagation()
  setConfirmTarget(image)
}

const confirmDelete = async () => {
  if (!confirmTarget) return
  const image = confirmTarget
  setConfirmTarget(null)
  setDeletingId(image.id)
  try {
    const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/gallery`, {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body:    JSON.stringify({ imageId: image.id }),
    })
    if (!res.ok) throw new Error()
    setImages(prev => prev.filter(img => img.id !== image.id))
  } catch {
    setError('Failed to delete image.')
  } finally {
    setDeletingId(null)
  }
}

  // ── Upload new image to gallery ──────────────────────────────────────────

  const handleUploadToGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      Array.from(files).forEach(f => form.append('files', f))
      const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/gallery/upload`, {
        method:  'POST',
        headers: { ...authHeaders() },
        body:    form,
      })
      if (!res.ok) throw new Error()
      await fetchGallery() // refresh grid
    } catch {
      setError('Upload failed — please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Hidden file input for gallery upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUploadToGallery}
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2147483647 }}
        onClick={onClose}
      >
        {/* Modal panel */}
        <div
          className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col bg-white shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
          >
            <div>
              <h2 className="text-base font-semibold text-gray-900">Your Gallery</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Select a saved image or upload a new one
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            >
              <X size={18} />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 px-5 py-3 border-b border-gray-100">
            {/* Upload to gallery (saves to vendor gallery) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border-2 border-dashed transition-all"
              style={{ borderColor: BRAND, color: BRAND }}
            >
              {uploading
                ? <><Loader2 size={13} className="animate-spin" />Uploading…</>
                : <><Upload size={13} />Upload from Device</>
              }
            </button>

            {/* Upload from device (triggers existing Canvas flow, untouched) */}
            {/* <button
              onClick={() => { onClose(); onUploadFromDevice() }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-all"
              style={{ backgroundColor: BRAND }}
            >
              <Upload size={13} />
              Upload from Device
            </button> */}
          </div>

          {/* Body — scrollable image grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 mb-3">{error}</p>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin" style={{ color: BRAND }} />
              </div>
            )}

            {/* Empty */}
            {!loading && images.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                <Images size={36} />
                <p className="text-sm font-medium text-gray-500">No saved images yet</p>
                <p className="text-xs text-center">
                  Upload images to your gallery to reuse them<br />across any design without re-uploading.
                </p>
              </div>
            )}

            {/* Grid */}
            {!loading && images.length > 0 && (
              <>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {images.map(image => {
                    const isUsing    = usingId    === image.id
                    const isDeleting = deletingId === image.id
                    const isHovered  = hoveredId  === image.id

                    return (
                      <div
                        key={image.id}
                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer ring-2 ring-transparent hover:ring-orange-400 transition-all"
                        onClick={() => onImageSelected ? (onImageSelected(image), onClose()) : handleUse(image)}
                        onMouseEnter={() => setHoveredId(image.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        title={image.filename}
                      >
                        <img
                          src={image.url}
                          alt={image.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {/* Use overlay */}
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity duration-150"
                          style={{
                            backgroundColor: 'rgba(0,0,0,0.55)',
                            opacity: isHovered || isUsing || isDeleting ? 1 : 0,
                          }}
                        >
                          {isUsing ? (
                            <Loader2 size={18} className="animate-spin text-white" />
                          ) : (
                            <span className="text-white text-xs font-semibold px-2 py-1 rounded-md"
                              style={{ backgroundColor: BRAND }}>
                              Use
                            </span>
                          )}
                        </div>

                        {/* Delete button — top-right corner */}
                        <button
                          onClick={e => handleDelete(e, image)}
                          disabled={!!deletingId || !!usingId}
                          className="absolute top-1 right-1 p-1 rounded-md text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                          style={{
                            opacity:         isHovered ? 1 : 0,
                            backgroundColor: isDeleting ? '#ef4444' : 'rgba(0,0,0,0.5)',
                          }}
                          title="Delete from gallery"
                        >
                          {isDeleting
                            ? <Loader2 size={10} className="animate-spin" />
                            : <Trash2 size={10} />
                          }
                        </button>
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  {images.length} image{images.length !== 1 ? 's' : ''} in your gallery
                </p>
              </>
            )}
          </div>
        </div>
      </div>
            {/* Delete confirmation modal */}
      {confirmTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setConfirmTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} className="text-red-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Remove from Gallery</h3>
            </div>
            <p className="text-xs text-gray-500 ml-12 mb-5 leading-relaxed">
              <span className="font-medium text-gray-700">{confirmTarget.filename}</span> will be
              removed from your gallery. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmTarget(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GalleryPickerModal