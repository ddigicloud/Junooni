import { model } from "@medusajs/framework/utils"

export const SizeChart = model.define("size_chart", {
  id: model.id().primaryKey(),
  name: model.text().nullable(),
  chart: model.text(),
  sku: model.text().unique(),
  manufacturer: model.text().nullable(),
manufacturer_sku: model.text().nullable(),
  chart_url: model.text().nullable()
})