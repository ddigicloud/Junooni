import { model } from "@medusajs/framework/utils"

export const SizeChart = model.define("size_chart", {
  id: model.id().primaryKey(),
  chart_url: model.text(),
})