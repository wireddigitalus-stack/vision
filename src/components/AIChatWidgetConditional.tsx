"use client";

import { usePathname } from "next/navigation";
import AIChatWidget from "./AIChatWidget";

export default function AIChatWidgetConditional() {
  const pathname = usePathname();
  // Hide chatbot on admin pages — it's a prospect tool, not a CRM tool
  if (pathname?.startsWith("/admin")) return null;
  return <AIChatWidget />;
}
