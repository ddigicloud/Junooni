import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Text
        className={clx("font-semibold", {
          "text-pink-600": price.price_type === "sale",
          "text-gray-900": price.price_type !== "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </Text>
      
      {price.price_type === "sale" && price.original_price && (
        <Text
          className="text-gray-500 text-sm line-through"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
    </div>
  )
}