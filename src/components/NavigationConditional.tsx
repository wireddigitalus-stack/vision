"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

export default function NavigationConditional() {
  const pathname = usePathname();
  // Dashboard has its own AdminHeader — public nav not needed there
  if (pathname?.startsWith("/admin")) return null;
  return <Navigation />;
}
