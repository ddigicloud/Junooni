"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { XCircle, Loader2, AlertTriangle, X, Clock, Mail, Shield } from "lucide-react"
import { requestCancelOtp, cancelOrderWithOtp } from "@/lib/orders"

type Step = "idle" | "otp_sent" | "verifying" | "canceled"

export default function CancelOrderButton({
  orderId,
  orderEmail,
  cancelDeadline,
}: {
  orderId: string
  orderEmail: string
  cancelDeadline: string
}) {
  const [step, setStep]         = useState<Step>("idle")
  const [otp, setOtp]           = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [sending, setSending]   = useState(false)
  const [expired, setExpired]   = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const router = useRouter()

  // Re-check deadline every 30s so stale tabs auto-hide the button
  useEffect(() => {
    const check = () => setExpired(Date.now() >= new Date(cancelDeadline).getTime())
    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [cancelDeadline])

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setInterval(() => setResendTimer(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [resendTimer])

  const deadlineStr = new Date(cancelDeadline).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  })

  // Mask email: abc***@gmail.com
  const maskedEmail = orderEmail.replace(
    /^(.{2})(.*)(@.*)$/,
    (_, a, b, c) => `${a}${"*".repeat(Math.min(b.length, 4))}${c}`
  )

  const handleSendOtp = async () => {
    setSending(true)
    setError(null)
    const result = await requestCancelOtp(orderId)
    setSending(false)
    if (result.success) {
      setStep("otp_sent")
      setResendTimer(30)
    } else {
      setError(result.error ?? "Failed to send OTP")
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP")
      return
    }
    setStep("verifying")
    setError(null)
    const result = await cancelOrderWithOtp(orderId, otp)
    if (result.success) {
      setStep("canceled")
      router.refresh()
    } else {
      setStep("otp_sent")
      setError(result.error ?? "Invalid OTP")
    }
  }

  if (expired || step === "canceled") {
    if (step === "canceled") return (
      <div className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-600 border border-red-200 rounded-xl bg-red-50">
        <XCircle className="w-4 h-4" />
        Order cancellation requested
      </div>
    )
    return null
  }

  return (
    <div className="space-y-2">

      {/* Deadline hint */}
      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Clock className="w-3.5 h-3.5" />
        You can cancel until {deadlineStr}
      </p>

      {/* Step 1 — idle: show cancel button */}
      {step === "idle" && (
        <button
          onClick={handleSendOtp}
          disabled={sending}
          className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold transition-colors border-2 border-red-200 rounded-xl text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {sending
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
            : <><XCircle className="w-4 h-4" /> Cancel Order</>
          }
        </button>
      )}

      {/* Step 2 — OTP sent: show input */}
      {(step === "otp_sent" || step === "verifying") && (
        <div className="p-5 border-2 border-red-100 rounded-2xl bg-red-50 space-y-4">

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100 shrink-0">
              <Shield className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Verify to cancel</p>
              <p className="text-xs text-gray-500 mt-0.5">
                We sent a 6-digit OTP to{" "}
                <span className="font-medium text-gray-700">{maskedEmail}</span>
              </p>
            </div>
          </div>

          {/* OTP input */}
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={e => {
              setOtp(e.target.value.replace(/\D/g, ""))
              setError(null)
            }}
            placeholder="Enter 6-digit OTP"
            className="w-full px-4 py-3 text-center text-xl font-bold tracking-[0.5em] border-2 border-red-200 rounded-xl focus:outline-none focus:border-red-400 bg-white text-gray-900 placeholder:text-gray-300 placeholder:tracking-normal placeholder:text-sm placeholder:font-normal"
          />

          {/* Confirm button */}
          <button
            onClick={handleVerifyOtp}
            disabled={step === "verifying" || otp.length !== 6}
            className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {step === "verifying"
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
              : "Confirm Cancellation"
            }
          </button>

          {/* Resend + back */}
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => { setStep("idle"); setOtp(""); setError(null) }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Go back
            </button>
            {resendTimer > 0
              ? <span className="text-gray-400">Resend in {resendTimer}s</span>
              : (
                <button
                  onClick={handleSendOtp}
                  disabled={sending}
                  className="text-red-500 font-medium hover:underline disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Resend OTP"}
                </button>
              )
            }
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-center text-red-500">{error}</p>
      )}
    </div>
  )
}