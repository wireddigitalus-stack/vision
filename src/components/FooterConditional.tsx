"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterConditional() {
  const pathname = usePathname();
  // No footer on the admin dashboard — it's an app, not a page
  if (pathname?.startsWith("/admin")) return null;
  return <Footer />;
}
