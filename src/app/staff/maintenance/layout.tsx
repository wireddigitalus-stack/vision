import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Portal — Vision",
  robots: { index: false, follow: false },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Maintenance",
    "theme-color": "#1A1200",
    "mobile-web-app-capable": "yes",
  },
};

export default function MaintenancePortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
