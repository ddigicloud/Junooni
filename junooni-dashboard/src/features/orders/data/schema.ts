import { z } from "zod";

export const OrderSchema = z.object({
  id: z.string(), // Changed from number to string
  customerName: z.string().min(1, "Customer name is required"),
  totalAmount: z.number().min(0, "Total must be non-negative"), // Renamed from `total`
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
    })
  ),
  paymentStatus: z.string(),
  deliveryStatus: z.string(),
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export type Order = z.infer<typeof OrderSchema>;
