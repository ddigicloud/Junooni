'use client';

import { usePathname } from 'next/navigation';
import { NavContainer } from "@modules/layout/templates/nav/NavContainer";
import { ReactNode } from 'react';

export default function ClientNavContainer({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Check if current page is home page or wishlist page
  const pathParts = pathname.split('/').filter(Boolean);
  
  // Original home page check (only country code exists)
  const isHomePage = pathParts.length === 1;
  
  // Check if it's the wishlist page
  const isWishlistPage = pathParts.length === 2 && pathParts[1].toLowerCase() === 'wishlist';
  
  // Apply the same properties if it's either home page or wishlist page
  const shouldApplyHomePageProps = isHomePage ;

  return (
    <NavContainer isHomePage={shouldApplyHomePageProps}>
      {children}
    </NavContainer>
  );
}