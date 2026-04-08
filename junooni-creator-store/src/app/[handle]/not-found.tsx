import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-2">Store not found</p>
        <p className="text-gray-400 mb-8">
          This creator store doesn't exist or hasn't been set up yet.
        </p>
        <Link
          href="https://junooni.com"
          className="inline-block px-6 py-3 rounded-full text-white text-sm font-medium"
          style={{ background: "#e65100" }}
        >
          Browse Junooni Marketplace
        </Link>
      </div>
    </div>
  )
}
