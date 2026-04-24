import type { Metadata } from "next";
import { Suspense } from "react";
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
      {/* Suspense required for useSearchParams() in Next.js 15 production builds */}
      <div className="pt-14">
        <Suspense fallback={<div className="min-h-screen bg-[#040812]" />}>
          {children}
        </Suspense>
      </div>
    </>
  );
}
