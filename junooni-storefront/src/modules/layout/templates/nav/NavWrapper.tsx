"use client";

import { usePathname } from 'next/navigation';
import { NavProvider } from "./NavContext";
import { NavContainer } from "./NavContainer";
import Nav from "@modules/layout/templates/nav";

export default function NavWrapper() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <NavProvider>
      <NavContainer isHomePage={isHomePage}>
        <Nav />
      </NavContainer>
    </NavProvider>
  );
}