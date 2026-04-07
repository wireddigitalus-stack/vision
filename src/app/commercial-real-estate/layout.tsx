import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commercial Real Estate Bristol TN | Office & Retail Space | Vision LLC",
  description:
    "Browse Vision LLC's commercial property portfolio in Bristol, TN. Executive office suites, retail storefronts, coworking, mixed-use & industrial. Largest private CRE owner Downtown Bristol. Call 423-573-1022.",
  keywords: [
    "commercial real estate Bristol TN",
    "office space Bristol Tennessee",
    "retail space downtown Bristol",
    "commercial property for lease Bristol",
    "coworking Bristol TN",
    "mixed-use commercial Bristol",
    "executive office suites Bristol",
    "Vision LLC properties",
  ],
  alternates: {
    canonical: "https://teamvisionllc.com/commercial-real-estate",
  },
  openGraph: {
    title: "Commercial Real Estate Portfolio | Vision LLC",
    description:
      "Executive offices, retail storefronts, coworking, mixed-use & industrial space in Downtown Bristol, TN. Tri-Cities #1 private commercial property owner.",
    url: "https://teamvisionllc.com/commercial-real-estate",
    type: "website",
  },
};

export default function CommercialRealEstateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
