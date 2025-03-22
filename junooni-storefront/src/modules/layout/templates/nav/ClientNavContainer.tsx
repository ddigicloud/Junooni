'use client';

import { usePathname } from 'next/navigation';
import { NavContainer } from "@modules/layout/templates/nav/NavContainer";
import { ReactNode } from 'react';



export default function ClientNavContainer({ children }: { children: ReactNode }) {
 
  const pathname = usePathname();


  // Check if current page is home page 
  // In your [countryCode]/(main) structure, the home page would just have the country code
  // e.g., /us/ or /uk/ would be home pages
  const pathParts = pathname.split('/').filter(Boolean);
  const isHomePage = pathParts.length === 1; // Only the country code segment exists
  
 


  return (
    <NavContainer isHomePage={isHomePage}>
      {children}
    </NavContainer>
  );
}