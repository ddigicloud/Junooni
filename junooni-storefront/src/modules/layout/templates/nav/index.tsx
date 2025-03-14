// Server Component for data fetching
import { Suspense } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import CartButton from "@modules/layout/components/cart-button";
import { CiSearch } from "react-icons/ci";
import { PiUserCircleThin } from "react-icons/pi";
import { listCategories } from "@lib/data/categories";
import { CategoryMegaMenu } from "./CategoryMegaMenu"; // Updated client component

export default async function Nav() {
  // Fetch all categories to get the complete hierarchy
  const allCategories = await listCategories();
  
  return (
    <div className="sticky inset-x-0 top-0 z-50 group">
      <header className="relative h-16 mx-auto duration-200 bg-white border-b border-ui-border-base">
        <nav className="relative flex items-center justify-between w-full h-full content-container txt-xsmall-plus text-ui-fg-subtle text-small-regular">
          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="text-2xl font-semibold uppercase hover:text-ui-fg-base mr-8"
              data-testid="nav-store-link"
            >
              JUNOONI
            </LocalizedClientLink>
            
            {/* Pass all categories to the client component for mega menu generation */}
            <CategoryMegaMenu categories={allCategories} />
          </div>
          
          <div className="flex items-center h-full gap-x-2">
            <LocalizedClientLink
              className="hover:text-ui-fg-base"
              href="/search"
              data-testid="nav-search-link"
            >
              <CiSearch className="w-6 h-6"/>
            </LocalizedClientLink>
            <div>
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                <PiUserCircleThin className="w-6 h-6"/>
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex gap-2 hover:text-ui-fg-base"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  );
}