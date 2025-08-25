import { z } from "zod"

export const PostAdminCreateSizeChartType = z.object({
    chart_url: z.string(),
})