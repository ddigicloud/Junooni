'use client'

import { ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const BackButton = () => {
  const router = useRouter();
  const rawPathname = usePathname() || '/';

  // Normalize path: remove trailing slashes except for root, and lowercase
  const normalize = (p: string) => {
    if (!p) return '/';
    let np = p.replace(/\/+$/, ''); // remove trailing slashes
    if (np === '') np = '/';
    return np;
  };

  const pathname = normalize(rawPathname);

  // If first segment is a 2-letter locale/country code (e.g. /in, /us, /fr),
  // treat it as a prefix and strip it for routing checks.
  // This avoids hardcoding any specific country code.
  const stripLocalePrefix = (p: string) => {
    if (p === '/') return '/';
    const parts = p.split('/').filter(Boolean); // ["in", "search", ...] or ["in"]
    if (parts.length === 0) return '/';

    // if first segment is exactly 2 letters (alpha), consider it a locale/country prefix
    const first = parts[0];
    if (/^[A-Za-z]{2}$/.test(first)) {
      // remove first segment
      const rest = parts.slice(1);
      if (rest.length === 0) return '/';
      return '/' + rest.join('/');
    }

    // otherwise return the original normalized path
    return p;
  };

  const logicalPath = stripLocalePrefix(pathname).toLowerCase();

  // Pages (logical routes) where back button should not show
  const noBackStarts = [
    '/',           // homepage (logical)
    '/search',
    '/categories',
    // '/account',
    // '/cart',
    // '/wishlist',
  ];

  // Hide button if logicalPath is exactly root OR starts with any of the excluded prefixes
  const shouldHideBackButton = noBackStarts.some((prefix) =>
    prefix === '/' ? logicalPath === '/' : logicalPath === prefix || logicalPath.startsWith(prefix + '/')
  );

  // optional debug:
  // console.log({ rawPathname, pathname, logicalPath, shouldHideBackButton });

  if (shouldHideBackButton) return null;

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // push to logical homepage: if user is on /in, fallback to '/in' else '/'
      // we can prefer keeping same locale when possible
      const parts = pathname.split('/').filter(Boolean);
      const first = parts[0];
      const localePrefix = /^[A-Za-z]{2}$/.test(first) ? `/${first}` : '';
      router.push(localePrefix || '/');
    }
  };

  return (
    <button
      onClick={handleGoBack}
      className="flex items-center justify-center w-8 h-8 transition-colors duration-200 rounded-full hover:bg-gray-100"
      aria-label="Go back"
    >
      <ArrowLeft className="h-6 text-gray-700 w-7" />
    </button>
  );
};

export default BackButton;
