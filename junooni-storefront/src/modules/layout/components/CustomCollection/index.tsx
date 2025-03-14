"use client";

import { useEffect, useState } from "react";
import { listCollections } from "@lib/data/collections"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const CustomCollection = () => {
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      const data = await listCollections();
      setCollections(data.collections);
      setLoading(false);
    };

    fetchCollections();
  }, []);

 

  if (loading) return <p className="text-sm font-semibold">Collections</p>;

  return (
    <div>
      {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="font-semibold text-gray-800">
                  Collections
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="text-sm hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
    </div>
  );
};

export default CustomCollection;




// {collection.products?.length > 0 ? (
//   collection.products.map((product: any) => (
//     <div key={product.id}>
//       <h4>{product.title}</h4>
//       <p>{product.description}</p>
//     </div>
//   ))
// ) : (
//   <p>No products in this collection.</p>
// )}