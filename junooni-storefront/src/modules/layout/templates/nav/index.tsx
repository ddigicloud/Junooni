// Server Component for data fetching
import { Suspense } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import CartButton from "@modules/layout/components/cart-button";

import { listCategories } from "@lib/data/categories";
import { CategoryMegaMenu } from "./CategoryMegaMenu";
import MobileMenu from "./MobileMenu";
import { Search } from "lucide-react";
import { UserCircle } from "lucide-react";


export default async function Nav() {
  // Fetch all categories to get the complete hierarchy
  const allCategories = await listCategories();
  
  return (
    <div className="sticky inset-x-0 top-0 z-[1000] group">
      <header className="relative h-16 mx-auto duration-200 bg-white border-b border-ui-border-base">
        <nav className="relative flex items-center justify-between w-full h-full content-container txt-xsmall-plus text-ui-fg-subtle text-small-regular">
          {/* Mobile Layout (flex on all devices, different layouts based on breakpoints) */}
          <div className="flex items-center justify-between w-full h-full md:hidden">
            {/* Left: Logo on xsmall screens */}
            <div className="flex items-center">
              <LocalizedClientLink
                href="/"
                className="text-2xl font-semibold uppercase hover:text-ui-fg-base"
                data-testid="nav-store-link"
              >
                JUNOONI
              </LocalizedClientLink>
            </div>
            
            {/* Right: Hamburger Menu and Icons */}
            <div className="flex items-center">
              {/* Icons - Hidden on xsmall screens */}
              <div className="items-center hidden mr-4 sm:flex gap-x-3">
                <LocalizedClientLink
                  className="hover:text-ui-fg-base"
                  href="/search"
                  data-testid="nav-search-link"
                >
                  <Search className="w-5 h-5"/>
                </LocalizedClientLink>
                <LocalizedClientLink
                  className="hover:text-ui-fg-base"
                  href="/account"
                  data-testid="nav-account-link"
                >
                  <UserCircle className="w-5 h-5"/>
                </LocalizedClientLink>
                <Suspense
                  fallback={
                    <LocalizedClientLink
                      className="hover:text-ui-fg-base"
                      href="/cart"
                      data-testid="nav-cart-link"
                    >
                    </LocalizedClientLink>
                  }
                >
                  <CartButton />
                </Suspense>
              </div>
              
              {/* Hamburger Menu - Always visible on mobile */}
              <div className="flex items-center">
                <MobileMenu categories={allCategories} />
              </div>
            </div>
          </div>
          
          {/* Desktop Layout (hidden on mobile, visible on md and up) */}
          <div className="items-center hidden h-full md:flex">
            <LocalizedClientLink
              href="/"
              className="mr-8 text-2xl font-semibold uppercase hover:text-ui-fg-base"
              data-testid="nav-store-link"
            >
              JUNOONI
            </LocalizedClientLink>
          
          </div>

          <CategoryMegaMenu categories={allCategories}  />
          
          <div className="items-center hidden h-full md:flex gap-x-2">
            <LocalizedClientLink
              className="hover:text-ui-fg-base"
              href="/search"
              data-testid="nav-search-link"
            >
              <Search className="w-5 h-5"/>
            </LocalizedClientLink>
            <div>
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                <UserCircle className="w-5 h-5"/>
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