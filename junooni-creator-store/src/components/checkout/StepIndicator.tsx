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
    <div className="flex items-center w-full py-2">
      {STEPS.map((step, i) => {
        const isDone   = i < currentIndex
        const isActive = i === currentIndex
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none min-w-0">
            {/* Step bubble + label */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                style={{
                  background: isDone || isActive ? brandPrimary : `${brandPrimary}18`,
                  color:      isDone || isActive ? "white" : `${brandPrimary}70`,
                  border:     isDone || isActive ? "none" : `1.5px solid ${brandPrimary}30`,
                }}
              >
                {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
              </div>
              <span
                className="text-[10px] sm:text-xs font-medium"
                style={{ color: isActive ? brandPrimary : isDone ? `${brandPrimary}cc` : `${brandPrimary}50` }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector — flex-1 fills whatever space is left */}
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-1.5 sm:mx-2 mb-5 rounded-full transition-all"
                style={{ background: isDone ? brandPrimary : `${brandPrimary}25` }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}