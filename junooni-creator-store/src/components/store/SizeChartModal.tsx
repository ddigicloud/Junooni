"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Ruler } from "lucide-react"

interface SizeChart {
  id: string
  name?: string
  chart: string
}

interface Props {
  sizeChart: SizeChart
  brandPrimary: string
  isDark: boolean
}

export default function SizeChartModal({ sizeChart, brandPrimary, isDark }: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!sizeChart?.chart) return null

  const modal = (
    <div
      className="fixed inset-0 flex items-start sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm"
      style={{ zIndex: 99999 }}
      onClick={() => setOpen(false)}
    >
      <div
        className={`relative w-full max-w-2xl overflow-hidden rounded-b-2xl sm:rounded-2xl shadow-2xl flex flex-col
          mt-[112px] sm:mt-0
          max-h-[calc(100vh-112px)] sm:max-h-[80vh]
          ${isDark ? "bg-zinc-900 text-white" : "bg-white text-gray-900"}`}
        style={{ zIndex: 99999 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
          isDark ? "border-white/10" : "border-gray-100"
        }`}>
          <div>
            <h2 className="text-lg font-semibold">Size Guide</h2>
            {sizeChart.name && (
              <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-gray-400"}`}>
                {sizeChart.name}
              </p>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* HTML content */}
        <div className="overflow-auto flex-1 px-6 py-4">
          <div
            className={`size-chart-content prose prose-sm max-w-none ${
              isDark ? "prose-invert text-white/80" : "text-gray-700"
            }`}
            dangerouslySetInnerHTML={{ __html: sizeChart.chart }}
          />
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-base mt-2 font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
        style={{ color: brandPrimary }}
      >
        <Ruler className="w-3.5 h-3.5" />
        Size Guide
      </button>

      {/* Portal renders directly under <body>, bypassing all stacking contexts */}
      {mounted && open && createPortal(modal, document.body)}
    </>
  )
}