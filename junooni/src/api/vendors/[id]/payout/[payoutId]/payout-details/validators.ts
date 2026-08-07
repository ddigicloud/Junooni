import { z } from "zod"

export const PostStoreCreatePayoutDetail = z.object({
  type: z.enum(["adjustment", "refund"] as const),
  amount:z.number().refine((val) => val !== 0, {
    message: "Amount cannot be zero",
  }).refine((val) => Number.isFinite(val), {
    message: "Amount must be a valid finite number",
  }),
  reason:z.string().min(5, {
    message: "Reason must be at least 5 characters long",
  }).max(500, {
    message: "Reason cannot exceed 500 characters",
  }),
  notes: z.string().max(1000, {
    message: "Notes cannot exceed 1000 characters",
  }).optional(),
  order_id: z.string().min(1, {
    message: "Order ID cannot be empty if provided",
  }).optional(),
  order_item_id: z.string().min(1, {
    message: "Order item ID cannot be empty if provided",
  }).optional(),
  product_id: z.string().min(1, {
    message: "Product ID cannot be empty if provided",
  }).optional(),
})

export const GetStorePayoutDetails = z.object({
  order_id: z.string().optional(),
  type: z.enum(["earning", "payout", "adjustment", "refund"]).optional(),
  limit: z.string().regex(/^\d+$/, {
    message: "Limit must be a positive integer",
  }).transform((val) => parseInt(val)).refine((val) => val > 0 && val <= 100, {
    message: "Limit must be between 1 and 100",
  }).optional(),
  offset: z.string().regex(/^\d+$/, {
    message: "Offset must be a non-negative integer",
  }).transform((val) => parseInt(val)).refine((val) => val >= 0, {
    message: "Offset must be non-negative",
  }).optional(),
})

export type PostStoreCreatePayoutDetailType = z.infer<typeof PostStoreCreatePayoutDetail>
export type GetStorePayoutDetailsType = z.infer<typeof GetStorePayoutDetails>