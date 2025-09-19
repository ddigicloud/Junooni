'use client'

import { usePathname } from "next/navigation";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Image from "next/image";
import junoonilogo from "@assets/JUNOONI_logo.ico";

const LogoDisplay = () => {
  const rawPathname = usePathname() || "/";

  // Normalize: strip trailing slashes
  const normalize = (p: string) => {
    if (!p) return "/";
    let np = p.replace(/\/+$/, "");
    if (np === "") np = "/";
    return np;
  };

  const pathname = normalize(rawPathname);

  // Strip 2-letter locale/country prefix (e.g. /in, /us, /fr)
  const stripLocalePrefix = (p: string) => {
    if (p === "/") return "/";
    const parts = p.split("/").filter(Boolean);
    if (parts.length === 0) return "/";
    const first = parts[0];
    if (/^[A-Za-z]{2}$/.test(first)) {
      const rest = parts.slice(1);
      if (rest.length === 0) return "/";
      return "/" + rest.join("/");
    }
    return p;
  };

  const logicalPath = stripLocalePrefix(pathname);

  // Pages where back button should NOT show
  const noBackButtonPages = [
    "/",
    "/search",
    "/categories",
    // "/account",
    // "/cart",
    // "/wishlist",
  ];

  const isHomePage = logicalPath === "/";
  const isMainPage = noBackButtonPages.includes(logicalPath);
  const isCategoryPage = /^\/categories\/[^/]+$/.test(logicalPath);

  const showBackButton = !(isHomePage || isMainPage || isCategoryPage);

  return (
    <LocalizedClientLink
      href="/"
      className={`transition-colors duration-300 ${
        showBackButton ? "flex items-center" : "text-2xl font-semibold uppercase"
      }`}
      data-testid="nav-store-link"
    >
      {showBackButton ? (
        <Image
          src={junoonilogo}
          alt="Junooni Logo"
          width={120}
          height={40}
          className="w-auto h-8 rounded-sm"
          priority
        />
      ) : (
        "JUNOONI"
      )}
    </LocalizedClientLink>
  );
};

export default LogoDisplay;
