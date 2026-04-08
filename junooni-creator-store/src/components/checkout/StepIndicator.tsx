"use client"

import { Check } from "lucide-react"

const STEPS = [
  { id: "address",  label: "Address" },
  { id: "delivery", label: "Shipping" },
  { id: "payment",  label: "Payment" },
  { id: "review",   label: "Review" },
]

export default function StepIndicator({
  currentStep,
  brandPrimary = "#e65100",
}: {
  currentStep: string
  brandPrimary?: string
}) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep)

  return (
    <div className="flex items-center justify-center w-full py-2">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex
        const isActive = i === currentIndex
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                style={{
                  background: isDone || isActive ? brandPrimary : "#f3f4f6",
                  color: isDone || isActive ? "white" : "#9ca3af",
                }}
              >
                {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
              </div>
              <span
                className="text-xs font-medium whitespace-nowrap"
                style={{ color: isActive ? brandPrimary : isDone ? "#6b7280" : "#d1d5db" }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="h-0.5 w-10 sm:w-16 mx-2 mb-5 rounded-full transition-all"
                style={{ background: isDone ? brandPrimary : "#e5e7eb" }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
