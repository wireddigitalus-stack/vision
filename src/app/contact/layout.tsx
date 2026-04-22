import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Vision LLC | Lease Inquiries & Property Tours | Bristol, TN",
  description:
    "Contact Vision LLC for commercial real estate in Bristol TN, Kingsport, Johnson City & the Tri-Cities. Call (423) 573-1022 or fill out our form to schedule a tour of office suites, retail space, or coworking memberships.",
  keywords: [
    "contact Vision LLC Bristol TN",
    "commercial real estate inquiry Bristol Tennessee",
    "office space tour Bristol TN",
    "leasing inquiry Tri-Cities CRE",
    "schedule property tour Bristol",
    "Vision LLC leasing contact",
    "Bristol TN coworking inquiry",
    "executive advisement contact",
    "commercial property Bristol Virginia",
    "423-573-1022 Vision LLC",
  ],
  alternates: {
    canonical: "https://teamvisionllc.com/contact",
  },
  openGraph: {
    title: "Contact Vision LLC | Commercial Real Estate Experts — Bristol, TN",
    description:
      "Reach out to schedule a tour of office suites, retail space, or coworking memberships in Downtown Bristol. Vision LLC — the Tri-Cities' leading commercial property firm.",
    url: "https://teamvisionllc.com/contact",
    siteName: "Vision LLC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Vision LLC | Commercial Real Estate | Bristol, TN",
    description:
      "Schedule a tour or ask about available commercial space in the Tri-Cities TN/VA. (423) 573-1022 | leasing@teamvisionllc.com",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
