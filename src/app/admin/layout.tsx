import type { Metadata } from "next";
import AdminHeader from "@/components/AdminHeader";

export const metadata: Metadata = {
  title: "VISION | Property Intelligence Platform",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminHeader />
      {/* pt-14 clears the fixed 56px admin header */}
      <div className="pt-14">{children}</div>
    </>
  );
}
