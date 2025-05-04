import { Suspense } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import CartButton from "@modules/layout/components/cart-button";
import AccountButton from "@modules/layout/components/account-button";
import { Heart, Search, UserCircle } from "lucide-react";
import { listCategories } from "@lib/data/categories";
import { CategoryMegaMenu } from "./CategoryMegaMenu";
import MobileMenu from "./MobileMenu";
import { ShoppingCart } from "lucide-react"

import SearchBar from "@modules/layout/components/search-button";


export default async function Nav() {
  const allCategories = await listCategories();
 
  return (
    <nav className="relative flex items-center justify-between w-full h-full content-container txt-xsmall-plus text-small-regular">
      {/* Mobile Layout */}
      <div className="flex items-center justify-between w-full h-full md:hidden">
        {/* Left: Logo */}
        <div className="flex items-center">
          <LocalizedClientLink
            href="/"
            className="text-2xl font-semibold uppercase transition-colors duration-300"
            data-testid="nav-store-link"
          >
            JUNOONI
          </LocalizedClientLink>
        </div>
        
        {/* Right: Mobile Menu and Icons */}
        <div className="flex items-center">
          {/* Icons - Hidden on xsmall screens */}
          <div className="items-center hidden mr-4 sm:flex gap-x-3">
            <LocalizedClientLink
              className="transition-colors duration-300"
              href="/search"
              data-testid="nav-search-link"
            >
              <Search className="w-5 h-5"/>
            </LocalizedClientLink>
            
            {/* Replace this with the new AccountButton */}
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="transition-colors duration-300"
                  href="/account"
                  data-testid="nav-account-link"
                >
                  <UserCircle className="w-5 h-5"/>
                </LocalizedClientLink>
              }
            >
              <AccountButton />
            </Suspense>
            
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="transition-colors duration-300"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
          
          {/* Hamburger Menu */}
          <div className="flex items-center">
            <MobileMenu categories={allCategories} />
          </div>
        </div>
      </div>
      
      {/* Desktop Layout */}
      <div className="items-center hidden md:flex">
        <LocalizedClientLink
          href="/"
          className="mr-8 text-2xl font-semibold uppercase transition-colors duration-300"
          data-testid="nav-store-link"
        >
          JUNOONI
        </LocalizedClientLink>
      </div>

      <CategoryMegaMenu categories={allCategories} />
      
      <div className="items-center hidden h-full md:flex gap-x-4">
        {/* <LocalizedClientLink
          className="transition-colors duration-300"
          href="/search"
          data-testid="nav-search-link"
        >
          <Search className="w-5 h-5"/>
        </LocalizedClientLink> */}
        <SearchBar categories={allCategories} />

        
        {/* Replace this with the new AccountButton */}
        <Suspense
          fallback={
            <LocalizedClientLink
              className="transition-colors duration-300"
              href="/account"
              data-testid="nav-account-link"
            >
              <UserCircle className="w-5 h-5"/>
            </LocalizedClientLink>
          }
        >
          <AccountButton />
        </Suspense>
        
        <LocalizedClientLink
          className="transition-colors duration-300 "
          href="/wishlist"
          data-testid="nav-account-link"
        >
          <Heart className="w-5 h-5"/>
        </LocalizedClientLink>
        
        <Suspense
          fallback={
            <LocalizedClientLink
              className="transition-colors duration-300"
              href="/cart"
              data-testid="nav-cart-link"
            >
            <ShoppingCart className="w-5 h-5" />
            </LocalizedClientLink>
          }
        >
          <CartButton />
        </Suspense>
      </div>
    </nav>
  );
}
