import minimalcap from "../../../public/minimalcap.jpeg"
import minimaltee from "../../../public/minimaltee.jpeg"
import minimalhoodie from "../../../public/minimalhoodie.jpeg"
import minimalmug from "../../../public/minimalmug.jpeg"

const FAKE_PRODUCTS = [
  { id: "fake_1", title: "Classic Creator Tee",    price: "₹699",   image: minimaltee },
  { id: "fake_2", title: "Limited Drop Hoodie",    price: "₹1,299", image: minimalhoodie },
  { id: "fake_3", title: "Signature Cap",          price: "₹499",   image: minimalcap },
  { id: "fake_4", title: "Fan Favourite Mug",      price: "₹399",   image: minimalmug },
]

export function PlaceholderProductGrid({
  columns = 3,
  brandPrimary,
}: {
  columns?: number
  brandPrimary: string
}) {
  const gridClass =
    columns === 2 ? "grid-cols-2" :
    columns === 4 ? "grid-cols-2 md:grid-cols-4" :
    "grid-cols-2 md:grid-cols-3"

  const items = FAKE_PRODUCTS.slice(0, columns)

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {items.map(p => (
        <div key={p.id} className="space-y-3 cursor-default select-none">
          <div className="overflow-hidden bg-gray-100 aspect-square rounded-2xl">
            <img
              src={typeof p.image === "string" ? p.image : (p.image as any).src}
              alt={p.title}
              className="object-cover w-full h-full opacity-60"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">{p.title}</p>
            <p className="text-sm font-semibold" style={{ color: brandPrimary + "80" }}>
              {p.price}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PlaceholderProductGrid