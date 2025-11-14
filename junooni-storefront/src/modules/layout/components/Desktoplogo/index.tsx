'use client'

import { useState, useEffect } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Image from "next/image";
import junooniHeaderLogo from "@assets/junooni.png";
import junooniWhiteLogo from "@assets/junooni-white.png";

const DesktopLogo = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <LocalizedClientLink
      href="/"
      className="mr-8 text-2xl font-semibold uppercase transition-colors duration-300"
      data-testid="nav-store-link"
    >
      <Image
        src={isScrolled ? junooniWhiteLogo : junooniHeaderLogo}
        alt="Junooni Logo"
        className="w-auto h-6 transition-all duration-300"
        priority
      />
    </LocalizedClientLink>
  );
};

export default DesktopLogo;