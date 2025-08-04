"use client"

import { useSearchParams } from "next/navigation"

interface StepIndicatorProps {
  cart: any
}

const StepIndicator = ({ cart }: StepIndicatorProps) => {
  const searchParams = useSearchParams()
  const currentStep = searchParams.get("step") || "address"

  const steps = [
    {
      id: 'address',
      title: 'Shipping',
      description: 'Address details',
      completed: cart?.shipping_address && cart?.billing_address && cart?.email
    },
    {
      id: 'delivery',
      title: 'Delivery',
      description: 'Shipping method',
      completed: cart?.shipping_methods?.length > 0
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Payment details',
      // ✅ FIXED: Only completed when actually past payment step or paid by gift card
      completed: 
        (currentStep === "review") || // On review step = payment completed
        (cart?.gift_cards?.length > 0 && cart?.total === 0) // OR fully paid by gift card
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Confirm order',
      completed: false // Never completed until order is placed
    }
  ]

  // ✅ IMPROVED: Make sure steps show as completed in order
  const processedSteps = steps.map((step, index) => {
    const stepIndex = steps.findIndex(s => s.id === currentStep)
    const thisStepIndex = index
    
    // Step is completed if:
    // 1. We're past this step, OR
    // 2. This step's specific completion criteria is met
    const isCompleted = 
      (stepIndex > thisStepIndex) || // Past this step
      step.completed || // Step's own completion logic
      (step.id === currentStep && step.completed) // Currently on this step and it's complete

    return {
      ...step,
      completed: isCompleted
    }
  })

  return (
    <div className="p-6 mb-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <div className="flex items-center justify-between">
        {processedSteps.map((step, index) => {
          const isActive = currentStep === step.id
          const isCompleted = step.completed
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#e65100] text-white shadow-lg'
                      : isActive
                      ? 'bg-[#e65100] text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </div>
                  <div className={`text-xs ${isActive || isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                    {step.description}
                  </div>
                </div>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                  isCompleted ? 'bg-[#e65100]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StepIndicator