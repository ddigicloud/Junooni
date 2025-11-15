// import { Suspense } from "react";
// import LocalizedClientLink from "@modules/common/components/localized-client-link";
// import CartButton from "@modules/layout/components/cart-button";
// import AccountButton from "@modules/layout/components/account-button"; // Add this import
// import { Heart, Search, User } from "lucide-react";
// import { listCategories } from "@lib/data/categories";
// import { CategoryMegaMenu } from "./CategoryMegaMenu";
// import junoonilogo from "@assets/junooni_header_logo.png";
// import MobileMenu from "./MobileMenu";
// import SearchBar from "@modules/layout/components/search-button";
// import WishlistButton from "@modules/wishlists/components/wishlist-button";

// export default async function Nav() {
//   const allCategories = await listCategories();
 
//   return (
//     <nav className="relative flex items-center justify-between w-full h-full px-2 py-4 sm:p-4 content-container txt-xsmall-plus text-small-regular">
//       {/* Mobile Layout */}
//       <div className="flex items-center justify-between w-full h-full md:hidden">
//         {/* Left: Logo */}
//         <div className="flex items-center">
//           <LocalizedClientLink
//             href="/"
//             className="text-2xl font-semibold uppercase transition-colors duration-300"
//             data-testid="nav-store-link"
//           >
//             JUNOONI
//           </LocalizedClientLink>
//         </div>
        
//         {/* Right: Mobile Menu and Icons */}
//         <div className="flex items-center">
//           {/* Icons - Hidden on xsmall screens */}
//           <div className="flex items-center mt-1 mr-4 gap-x-3">
//             {/* <LocalizedClientLink
//               className="transition-colors duration-300"
//               href="/search"
//               data-testid="nav-search-link"
//             >
//               <Search className="w-5 h-5"/>
//             </LocalizedClientLink> */}
//             <div className="relative mb-1">
//               <SearchBar categories={allCategories} />
//             </div>
            
//             {/* Replace this with the new AccountButton */}
//             <Suspense
//               fallback={
//                 <LocalizedClientLink
//                   className="transition-colors duration-300"
//                   href="/account"
//                   data-testid="nav-account-link"
//                 >
//                   <User className="w-5 h-5"/>
//                 </LocalizedClientLink>
//               }
//             >
//               <AccountButton />
//             </Suspense>
     
//             <LocalizedClientLink
//               className="transition-colors duration-300"
//               href="/wishlist"
//               data-testid="nav-wishlist-link"
//             >
//               <Heart className="w-5 h-5 mb-1 mr-1"/>
//             </LocalizedClientLink>
              
//             <Suspense
//               fallback={
//                 <LocalizedClientLink
//                   className="transition-colors duration-300"
//                   href="/cart"
//                   data-testid="nav-cart-link"
//                 >
//                 </LocalizedClientLink>
//               }
//             >
//               <CartButton />
//             </Suspense>
//           </div>
          
//           {/* Hamburger Menu */}
//           <div className="flex items-center">
//             <MobileMenu categories={allCategories} />
//           </div>
//         </div>
//       </div>
      
//       {/* Desktop Layout */}
//       <div className="items-center hidden md:flex">
//         <LocalizedClientLink
//           href="/"
//           className="mr-8 text-2xl font-semibold uppercase transition-colors duration-300"
//           data-testid="nav-store-link"
//         >
//           JUNOONI
//         </LocalizedClientLink>
//       </div>

//       <CategoryMegaMenu categories={allCategories} />
      
//       <div className="items-center hidden h-full md:flex gap-x-4">
//         {/* <LocalizedClientLink
//           className="transition-colors duration-300"
//           href="/search"
//           data-testid="nav-search-link"
//         >
//           <Search className="w-5 h-5"/>
//         </LocalizedClientLink> */}
//         <SearchBar categories={allCategories} />
        
//         {/* Replace this with the new AccountButton */}
//         <LocalizedClientLink
//           className="transition-colors duration-300 "
//           href="/wishlist"
//           data-testid="nav-account-link"
//         >
//           <Heart className="w-6 h-6"/>
//         </LocalizedClientLink>
        
//         <Suspense
//           fallback={
//             <LocalizedClientLink
//               className="transition-colors duration-300"
//               href="/account"
//               data-testid="nav-account-link"
//             >
//               <User className="w-6 h-6"/>
//             </LocalizedClientLink>
//           }
//         >
//           <AccountButton />
//         </Suspense>
        
//         <Suspense
//           fallback={
//             <LocalizedClientLink
//               className="transition-colors duration-300"
//               href="/cart"
//               data-testid="nav-cart-link"
//             >
//             </LocalizedClientLink>
//           }
//         >
//           <CartButton />
//         </Suspense>
//       </div>
//     </nav>
//   );
// }

import { Suspense } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import CartButton from "@modules/layout/components/cart-button";
import AccountButton from "@modules/layout/components/account-button";
import { Heart, Search, User, ArrowLeft } from "lucide-react";
import { listCategories } from "@lib/data/categories";
import { CategoryMegaMenu } from "./CategoryMegaMenu";
import junoonilogo from "@assets/junooni_header_logo.png";
import MobileMenu from "./MobileMenu";
import SearchBar from "@modules/layout/components/search-button";
import WishlistButton from "@modules/wishlists/components/wishlist-button";
import Image from "next/image";
import junooniHeaderLogo from "@assets/junooni.png";
import LogoDisplay from "@modules/layout/components/LogoDisplay"; // We'll create this component
import BackButton from "@modules/layout/components/BackButton"; // We'll create this component

export default async function Nav() {
  const allCategories = await listCategories();
 
  return (
    <nav className="relative flex items-center justify-between w-full h-full px-2 py-4 sm:p-4 content-container txt-xsmall-plus text-small-regular">
      {/* Mobile Layout */}
      <div className="flex items-center justify-between w-full h-full md:hidden">
        {/* Left: Back Button (conditional) + Logo */}
        <div className="flex items-center gap-4">
          <BackButton />
          <LogoDisplay />
        </div>
        
        {/* Right: Mobile Menu and Icons */}
        <div className="flex items-center">
          {/* Icons - Hidden on xsmall screens */}
          <div className="flex items-center mt-1 mr-4 gap-x-3">
            <div className="relative mb-1">
              <SearchBar categories={allCategories} />
            </div>
            
            {/* Replace this with the new AccountButton */}
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="transition-colors duration-300"
                  href="/account"
                  data-testid="nav-account-link"
                >
                  <User className="w-5 h-5"/>
                </LocalizedClientLink>
              }
            >
              <AccountButton />
            </Suspense>
     
            <LocalizedClientLink
              className="transition-colors duration-300"
              href="/wishlist"
              data-testid="nav-wishlist-link"
            >
              <Heart className="w-5 h-5 mb-1 mr-1"/>
            </LocalizedClientLink>
              
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
          className="mr-8 text-2xl font-extrabold uppercase transition-colors duration-300 font-archivo tracking-tighter"
          data-testid="nav-store-link"
        >
          JUNOONI
          {/* <img src={junooniHeaderLogo.src} alt="Junooni Logo" className="h-6"/> */}
        </LocalizedClientLink>
      </div>

      <CategoryMegaMenu categories={allCategories} />
      
      <div className="items-center hidden h-full md:flex gap-x-4">
        <SearchBar categories={allCategories} />
        
        {/* Replace this with the new AccountButton */}
        <LocalizedClientLink
          className="transition-colors duration-300 "
          href="/wishlist"
          data-testid="nav-account-link"
        >
          <Heart className="w-6 h-6"/>
        </LocalizedClientLink>
        
        <Suspense
          fallback={
            <LocalizedClientLink
              className="transition-colors duration-300"
              href="/account"
              data-testid="nav-account-link"
            >
              <User className="w-6 h-6"/>
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
    </nav>
  );
}