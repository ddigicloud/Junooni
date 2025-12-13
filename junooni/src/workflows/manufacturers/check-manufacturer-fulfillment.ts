// import {
//   createWorkflow,
//   WorkflowResponse,
//   transform,
// } from "@medusajs/framework/workflows-sdk"
// import { when } from "@medusajs/framework/workflows-sdk"
// import { getOrderStep } from "./steps/get-order"
// import { checkFulfillmentTypeStep } from "./steps/check-fulfillment-type"
// import { checkManufacturerBrandStep } from "./steps/check-manufacturer-brand"
// import { createQikinkOrderStep } from "./qikink/steps/create-order"

// /**
//  * Workflow input type
//  */
// export type CheckManufacturerFulfillmentInput = {
//   order_id: string
// }

// /**
//  * Workflow response type
//  */
// export type CheckManufacturerFulfillmentOutput = {
//   success: boolean
//   manufacturer?: string
//   order_synced: boolean
//   qikink_order_id?: number
//   qikink_order_number?: string
//   tracking?: {
//     tracking_number: string | null
//     tracking_url: string | null
//     carrier: string | null
//   }
//   message: string
// }

// /**
//  * Main workflow to check and handle manufacturer fulfillment
//  * This workflow orchestrates the process of:
//  * 1. Checking if order items require JUNOONI fulfillment
//  * 2. Identifying the manufacturer brand
//  * 3. Syncing order with appropriate manufacturer (currently Qikink)
//  */
// export const checkManufacturerFulfillmentWorkflow = createWorkflow(
//   "check-manufacturer-fulfillment",
//   (input: CheckManufacturerFulfillmentInput) => {
//     // Step 1: Fetch the complete order with all relationships
//     const order = getOrderStep(input.order_id)

//     // Step 2: Check fulfillment type for order items
//     const fulfillmentCheck = checkFulfillmentTypeStep({
//       order_id: input.order_id,
//       items: order.items,
//     })

//     // Step 3: Check manufacturer brand for JUNOONI-fulfilled items
//     const manufacturerCheck = when(
//       fulfillmentCheck,
//       ({ has_junooni_fulfillment }) => has_junooni_fulfillment === true
//     ).then(() => {
//       return checkManufacturerBrandStep({
//         order_id: input.order_id,
//         items: fulfillmentCheck.junooni_items,
//       })
//     })

//     // Step 4: Create Qikink order if manufacturer is Qikink
//     const qikinkOrder = when(
//       manufacturerCheck,
//       ({ manufacturer }) => manufacturer === "qikink"
//     ).then(() => {
//       return createQikinkOrderStep({
//         order,
//         items: manufacturerCheck.manufacturer_items,
//       })
//     })

//     // Transform and return response
//     const result = transform(
//       { fulfillmentCheck, manufacturerCheck, qikinkOrder },
//       (data) => {
//         // If no JUNOONI fulfillment
//         if (!data.fulfillmentCheck.has_junooni_fulfillment) {
//           return {
//             success: true,
//             order_synced: false,
//             message: "No items require JUNOONI fulfillment",
//           }
//         }

//         // If no manufacturer matched
//         if (!data.manufacturerCheck?.manufacturer) {
//           return {
//             success: true,
//             order_synced: false,
//             message: "No manufacturer brand matched for JUNOONI-fulfilled items",
//           }
//         }

//         // If Qikink order created
//         if (data.qikinkOrder) {
//           return {
//             success: true,
//             manufacturer: "qikink",
//             order_synced: true,
//             qikink_order_id: data.qikinkOrder.order_id,
//             qikink_order_number: data.qikinkOrder.order_number,
//             tracking: data.qikinkOrder.tracking,
//             message: data.qikinkOrder.message,
//           }
//         }

//         // Default response
//         return {
//           success: true,
//           order_synced: false,
//           message: "Order processed but not synced to manufacturer",
//         }
//       }
//     )

//     return new WorkflowResponse(result)
//   }
// )

import {
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { when } from "@medusajs/framework/workflows-sdk"
import { getOrderStep } from "./steps/get-order"
import { checkFulfillmentTypeStep } from "./steps/check-fulfillment-type"
import { checkManufacturerBrandStep } from "./steps/check-manufacturer-brand"
import { getQikinkTokenStep } from "./qikink/steps/get-token"
import { createQikinkOrderStep } from "./qikink/steps/create-order"

export type CheckManufacturerFulfillmentInput = {
  order_id: string
}

export type CheckManufacturerFulfillmentOutput = {
  success: boolean
  manufacturer?: string
  order_synced: boolean
  qikink_order_id?: number
  qikink_order_number?: string
  tracking?: {
    tracking_number: string | null
    tracking_url: string | null
    carrier: string | null
  }
  message: string
}

export const checkManufacturerFulfillmentWorkflow = createWorkflow(
  "check-manufacturer-fulfillment",
  (input: CheckManufacturerFulfillmentInput) => {
    const order = getOrderStep(input.order_id)

    const fulfillmentCheck = checkFulfillmentTypeStep({
      order_id: input.order_id,
      items: order.items,
    })

    const manufacturerCheck = when(
      fulfillmentCheck,
      ({ has_junooni_fulfillment }) => has_junooni_fulfillment === true
    ).then(() => {
      return checkManufacturerBrandStep({
        order_id: input.order_id,
        items: fulfillmentCheck.junooni_items,
      })
    })

    const qikinkToken = when(
      manufacturerCheck,
      ({ manufacturer }) => manufacturer === "qikink"
    ).then(() => {
      return getQikinkTokenStep()
    })

    const qikinkOrder = when(
      manufacturerCheck,
      ({ manufacturer }) => manufacturer === "qikink"
    ).then(() => {
      const orderInput = transform(
        { order, manufacturerCheck, qikinkToken },
        (data) => {
          let tokenString = ""
          
          if (data.qikinkToken) {
            if (typeof data.qikinkToken === "string") {
              tokenString = data.qikinkToken
            } else if (data.qikinkToken.accessToken) {
              // ✅ Correct key: accessToken (camelCase)
              tokenString = data.qikinkToken.accessToken
            } else if (data.qikinkToken.Accesstoken) {
              tokenString = data.qikinkToken.Accesstoken
            } else if (data.qikinkToken.token) {
              tokenString = data.qikinkToken.token
            } else if (data.qikinkToken.access_token) {
              tokenString = data.qikinkToken.access_token
            }
          }

          console.log("🔍 Token extraction:", {
            tokenType: typeof data.qikinkToken,
            hasAccessToken: !!(data.qikinkToken?.accessToken),
            tokenLength: tokenString?.length || 0,
            tokenPreview: tokenString ? tokenString.substring(0, 30) + "..." : "EMPTY",
          })

          if (!tokenString) {
            console.error("❌ Token extraction failed. qikinkToken structure:", data.qikinkToken)
            throw new Error("Failed to extract token string from qikinkToken")
          }

          return {
            order: data.order,
            items: data.manufacturerCheck.manufacturer_items,
            token: tokenString,
          }
        }
      )

      return createQikinkOrderStep(orderInput)
    })

    const result = transform(
      { fulfillmentCheck, manufacturerCheck, qikinkOrder },
      (data) => {
        if (!data.fulfillmentCheck.has_junooni_fulfillment) {
          return {
            success: true,
            order_synced: false,
            message: "No items require JUNOONI fulfillment",
          }
        }

        if (!data.manufacturerCheck?.manufacturer) {
          return {
            success: true,
            order_synced: false,
            message: "No manufacturer brand matched for JUNOONI-fulfilled items",
          }
        }

        if (data.qikinkOrder) {
          return {
            success: true,
            manufacturer: "qikink",
            order_synced: true,
            qikink_order_id: data.qikinkOrder.order_id,
            qikink_order_number: data.qikinkOrder.order_number,
            tracking: data.qikinkOrder.tracking,
            message: data.qikinkOrder.message || "Qikink order created successfully",
          }
        }

        return {
          success: true,
          order_synced: false,
          message: "Order processed but not synced to manufacturer",
        }
      }
    )

    return new WorkflowResponse(result)
  }
)