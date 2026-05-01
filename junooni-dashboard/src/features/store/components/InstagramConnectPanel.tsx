// src/features/store/components/InstagramConnectPanel.tsx
// Add this component to the store editor file (or import it)

import { useState, useEffect } from "react"
import { Instagram, ExternalLink, Loader2, Trash2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

interface InstagramPost {
  id: string
  media_url: string
  permalink: string
  caption?: string
  media_type: string
  timestamp: string
}

interface Props {
  token: string
  backendUrl: string
  isDark: boolean
}

export function InstagramConnectPanel({ token, backendUrl, isDark }: Props) {
  const [connected, setConnected] = useState(false)
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)

  const textFaint = isDark ? "text-gray-500" : "text-gray-400"
  const textPrimary = isDark ? "text-gray-200" : "text-gray-800"

  async function loadFeed() {
    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/vendors/me/instagram/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setConnected(data.connected ?? false)
        setPosts(data.posts ?? [])
      }
    } catch (e) {
      console.error("Instagram feed load failed:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFeed() }, [])

  // Check for instagram=connected in URL after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("instagram") === "connected") {
      loadFeed()
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname)
    }
    if (params.get("instagram") === "error") {
      console.error("Instagram connect error:", params.get("reason"))
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const handleConnect = () => {
    // Opens OAuth flow in current tab — Instagram redirects back to dashboard
    window.location.href = `${backendUrl}/vendors/me/instagram/connect?token=${encodeURIComponent(token)}`
  }

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Instagram? Your feed section will stop showing posts.")) return
    setDisconnecting(true)
    try {
      await fetch(`${backendUrl}/vendors/me/instagram/disconnect`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      setConnected(false)
      setPosts([])
    } catch (e) {
      console.error("Disconnect failed:", e)
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
        <span className={`text-xs ${textFaint}`}>Checking Instagram...</span>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="space-y-3">
        <div className={`p-3 rounded-xl border ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}>
              <Instagram className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className={`text-xs font-semibold ${textPrimary}`}>Connect Instagram</p>
              <p className={`text-[10px] mt-0.5 ${textFaint}`}>
                Show your latest Instagram posts on your store. Requires a Business or Creator account.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}
        >
          <Instagram className="w-4 h-4" />
          Connect Instagram account
        </button>
        <p className={`text-[10px] text-center ${textFaint}`}>
          You'll be redirected to Instagram to authorize. Make sure your account is set to Business or Creator.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Connected status */}
      <div className={`flex items-center justify-between p-2.5 rounded-xl border ${isDark ? "border-green-800/40 bg-green-900/10" : "border-green-200 bg-green-50"}`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-600">Instagram connected</p>
            <p className={`text-[10px] ${textFaint}`}>{posts.length} posts fetched</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={loadFeed} className={`p-1.5 rounded-lg border text-xs ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"} transition-colors`} title="Refresh feed">
            <RefreshCw className="w-3 h-3" />
          </button>
          <button onClick={handleDisconnect} disabled={disconnecting}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-red-800/50 text-red-400 hover:bg-red-900/20 text-xs transition-colors">
            {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Disconnect
          </button>
        </div>
      </div>

      {/* Post previews */}
      {posts.length > 0 && (
        <div>
          <p className={`text-[10px] ${textFaint} mb-1.5`}>Latest posts preview</p>
          <div className="grid grid-cols-3 gap-1">
            {posts.slice(0, 9).map(post => (
              <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer"
                className="aspect-square relative overflow-hidden rounded-lg bg-gray-800 group">
                <img src={post.media_url} alt={post.caption ?? "Instagram post"}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ExternalLink className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
          <p className={`text-[10px] mt-1.5 ${textFaint}`}>
            Add an "Instagram Feed" section in the Layout tab to display these on your store.
          </p>
        </div>
      )}

      {posts.length === 0 && (
        <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs ${isDark ? "border-yellow-800/40 bg-yellow-900/10 text-yellow-400" : "border-yellow-200 bg-yellow-50 text-yellow-700"}`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>No posts found. Make sure your Instagram account has published posts and is set to Business/Creator type.</p>
        </div>
      )}
    </div>
  )
}