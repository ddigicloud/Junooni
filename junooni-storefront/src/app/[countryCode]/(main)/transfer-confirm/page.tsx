"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { confirmTransfer } from "@lib/data/transfer"
import { setAuthToken } from "@lib/data/cookies" // your existing auth cookie setter

export default function TransferConfirmPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!token) {
      setErrorMsg("Invalid link — no token found.")
      setStatus("error")
      return
    }

    confirmTransfer(token)
      .then(async (data) => {
        setStatus("success")
        // Give user a moment to see the success state
        // then redirect to their account orders
        setTimeout(() => {
          router.push("/in/account/orders")
        }, 1500)
      })
      .catch((err) => {
        setErrorMsg(err.message)
        setStatus("error")
      })
  }, [token])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-b-2 border-black rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Confirming your identity...</p>
        </div>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-sm text-center">
          <div className="mb-4 text-5xl">🎉</div>
          <h1 className="mb-3 text-2xl font-bold">All done!</h1>
          <p className="mb-2 text-sm text-gray-500">
            Your order history and addresses have been moved to your account.
          </p>
          <p className="text-xs text-gray-400">
            Taking you to your orders...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-sm text-center">
        <div className="mb-4 text-5xl">⚠️</div>
        <h1 className="mb-3 text-2xl font-bold">Link Expired or Invalid</h1>
        <p className="mb-6 text-sm text-gray-500">{errorMsg}</p>
        <a
          href="/in/account"
          className="inline-block px-6 py-3 text-sm text-white bg-black rounded"
        >
          Go to Account to Re-send Email
        </a>
      </div>
    </div>
  )
}