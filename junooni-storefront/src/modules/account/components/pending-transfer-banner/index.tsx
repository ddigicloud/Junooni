// "use client"

// import { useState } from "react"
// import { retriggerTransferEmail } from "@lib/data/transfer"

// type Props = {
//   authToken: string
//   expiresAt: string // ISO string from customer.metadata.pending_transfer_expires
// }

// export default function PendingTransferBanner({ authToken, expiresAt }: Props) {
//   const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

//   const isExpired = new Date(expiresAt) < new Date()

//   async function handleResend() {
//     setStatus("sending")
//     try {
//       await retriggerTransferEmail(authToken)
//       setStatus("sent")
//     } catch {
//       setStatus("error")
//     }
//   }

//   return (
//     <div className="p-4 mb-6 border rounded-lg bg-amber-50 border-amber-200">
//       <p className="mb-1 text-sm font-semibold text-amber-800">
//         📦 You have guest orders waiting to be claimed
//       </p>
//       <p className="mb-3 text-sm text-amber-700">
//         {isExpired
//           ? "Your confirmation link has expired. Send a new one to merge your order history."
//           : "Check your email for a confirmation link to merge your previous orders into this account."}
//       </p>

//       {(isExpired || status === "error") && (
//         <button
//           onClick={handleResend}
//           disabled={status === "sending"}
//           className="px-4 py-2 text-sm text-white rounded bg-amber-600 disabled:opacity-50"
//         >
//           {status === "sending" ? "Sending..." : "Re-send confirmation email"}
//         </button>
//       )}

//       {status === "sent" && (
//         <p className="text-sm font-medium text-green-700">
//           ✅ Email sent! Check your inbox.
//         </p>
//       )}
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import { retriggerTransferEmail } from "@lib/data/transfer"

type Props = {
  expiresAt: string // no more authToken prop needed
}

export default function PendingTransferBanner({ expiresAt }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const isExpired = new Date(expiresAt) < new Date()

  async function handleResend() {
    setStatus("sending")
    try {
      await retriggerTransferEmail() // no argument needed anymore
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <p className="text-sm font-semibold text-amber-800 mb-1">
        📦 You have guest orders waiting to be claimed
      </p>
      <p className="text-sm text-amber-700 mb-3">
        {isExpired
          ? "Your confirmation link has expired. Send a new one to merge your order history."
          : "Check your email for a confirmation link to merge your previous orders into this account."}
      </p>

      {status !== "sent" && (
        <button
          onClick={handleResend}
          disabled={status === "sending"}
          className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors"
        >
          {status === "sending"
            ? "Sending..."
            : isExpired
            ? "Re-send confirmation email"
            : "Re-send email"}
        </button>
      )}

      {status === "sent" && (
        <p className="text-sm text-green-700 font-medium">
          ✅ Email sent! Check your inbox.
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600 mt-2">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  )
}