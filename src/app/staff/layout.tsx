import type { Metadata } from "next";

// Staff portals are private — never index
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
