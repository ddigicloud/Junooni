import { z } from "zod"

export const PostAdminCreateSizeChartType = z.object({
    chart_url: z.string().nullable(),
    chart: z.string(),
    name: z.string().nullable(),
    sku: z.string(),
    manufacturer: z.string().nullable(),
    manufacturer_sku: z.string().nullable(),
})