import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MapPin, Phone, ArrowRight, Check, ArrowLeft, Building2 } from "lucide-react";
import { PROPERTIES, COMPANY } from "@/lib/data";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LeaseBotTrigger from "@/components/LeaseBotTrigger";


type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return PROPERTIES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = PROPERTIES.find((p) => p.id === id);
  if (!property) return { title: "Property Not Found | Vision LLC" };
  const desc = property.description.substring(0, 160);
  const ogTitle = encodeURIComponent(property.name);
  const ogSubtitle = encodeURIComponent(`${property.type} · ${property.city} · ${property.sqft} sqft`);
  const ogTag = encodeURIComponent("Available Now");
  const ogUrl = `https://teamvisionllc.com/api/og?title=${ogTitle}&subtitle=${ogSubtitle}&tag=${ogTag}&type=property`;
  return {
    title: `${property.name} | Commercial Real Estate Bristol TN | Vision LLC`,
    description: desc,
    alternates: {
      canonical: `https://teamvisionllc.com/properties/${id}`,
    },
    openGraph: {
      title: `${property.name} | Vision LLC`,
      description: desc,
      url: `https://teamvisionllc.com/properties/${id}`,
      type: "website",
      images: [{ url: ogUrl, width: 1200, height: 630, alt: property.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${property.name} | Vision LLC`,
      description: desc,
      images: [ogUrl],
    },
  };
}


export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const property = PROPERTIES.find((p) => p.id === id);
  if (!property) notFound();


  const images = (property as any).images || ((property as any).image ? [(property as any).image] : []);
  const mainImage = (property as any).image || images[0];
  const otherImages = images.slice(1);

  const badgeColors: Record<string, string> = {
    green: "bg-[rgba(74,222,128,0.12)] text-[#4ADE80] border-[rgba(74,222,128,0.3)]",
    gold: "bg-[rgba(250,204,21,0.12)] text-[#FACC15] border-[rgba(250,204,21,0.3)]",
    blue: "bg-[rgba(96,165,250,0.12)] text-[#60A5FA] border-[rgba(96,165,250,0.3)]",
    gray: "bg-[rgba(156,163,175,0.12)] text-[#9CA3AF] border-[rgba(156,163,175,0.3)]",
  };

  // ── JSON-LD Schema ─────────────────────────────────────────────────────────
  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.name,
    description: property.description,
    url: `https://teamvisionllc.com/properties/${property.id}`,
    image: (property as any).image ? [`https://teamvisionllc.com${(property as any).image}`] : [],
    address: {
      "@type": "PostalAddress",
      streetAddress: (property as any).address || "Downtown Bristol",
      addressLocality: property.city.replace(", TN", "").replace(", VA", ""),
      addressRegion: property.city.includes("VA") ? "VA" : "TN",
      postalCode: "37620",
      addressCountry: "US",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.sqft,
      unitCode: "FTK",
      unitText: "square feet",
    },
    amenityFeature: property.features.map((f) => ({
      "@type": "LocationFeatureSpecification",
      name: f,
      value: true,
    })),
    offers: {
      "@type": "Offer",
      businessFunction: "https://purl.org/goodrelations/v1#LeaseOut",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Vision LLC",
        telephone: "+14235731022",
        url: "https://teamvisionllc.com",
      },
    },
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Vision LLC — ${property.name}`,
    description: property.description.substring(0, 200),
    url: `https://teamvisionllc.com/properties/${property.id}`,
    telephone: "+14235731022",
    address: {
      "@type": "PostalAddress",
      streetAddress: "100 5th St., Suite 2W",
      addressLocality: "Bristol",
      addressRegion: "TN",
      postalCode: "37620",
      addressCountry: "US",
    },
    hasMap: `https://maps.google.com/?q=${encodeURIComponent(property.city)}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://teamvisionllc.com" },
      { "@type": "ListItem", position: 2, name: "Properties", item: "https://teamvisionllc.com/commercial-real-estate" },
      { "@type": "ListItem", position: 3, name: property.name, item: `https://teamvisionllc.com/properties/${property.id}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navigation />
      <main>
        {/* Back nav */}
        <div className="pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Link
            href="/commercial-real-estate"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#4ADE80] transition-colors"
          >
            <ArrowLeft size={14} /> Back to All Properties
          </Link>
        </div>

        {/* Hero Image Gallery */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-auto lg:h-[480px]">
              {/* Main image */}
              <div className="relative lg:col-span-2 h-72 lg:h-full rounded-2xl overflow-hidden bg-[#111827]">
                {mainImage ? (
                  <Image src={mainImage} alt={property.imageAlt || property.name} fill className="object-cover" priority />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 size={64} className="text-[rgba(74,222,128,0.1)]" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${badgeColors[property.badgeColor]}`}>
                    {property.badge}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-semibold text-white">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] pulse-green" />
                    {property.status}
                  </span>
                </div>
              </div>
              {/* Thumbnail strip */}
              {otherImages.length > 0 && (
                <div className="hidden lg:grid grid-rows-3 gap-3 h-full">
                  {otherImages.slice(0, 3).map((img: string, i: number) => (
                    <div key={i} className="relative rounded-xl overflow-hidden bg-[#111827]">
                      <Image src={img} alt={`${property.name} photo ${i + 2}`} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{property.type}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{property.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <MapPin size={14} className="text-[#4ADE80]" />
                {property.address || property.city}
                <span className="mx-2 text-gray-700">·</span>
                {property.sqft} sqft
              </div>

              <div className="section-line mb-6" />
              <h2 className="text-xl font-bold text-white mb-4">About This Property</h2>
              <p className="text-gray-300 text-base leading-relaxed mb-8">{property.description}</p>

              <h2 className="text-xl font-bold text-white mb-4">Features & Amenities</h2>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {property.features.map((f) => (
                  <div key={f} className="flex items-center gap-3 glass rounded-xl p-3 border border-[rgba(74,222,128,0.08)]">
                    <Check size={15} className="text-[#4ADE80] flex-shrink-0" />
                    <span className="text-sm text-gray-300">{f}</span>
                  </div>
                ))}
              </div>

              {/* Location */}
              <h2 className="text-xl font-bold text-white mb-3">Location</h2>
              <p className="text-gray-400 text-sm">
                Located in the heart of the Tri-Cities commercial corridor — serving Bristol TN/VA, Kingsport, Johnson City, and the broader Northeast Tennessee/Southwest Virginia region.
              </p>
            </div>

            {/* Sidebar CTA */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 border border-[rgba(74,222,128,0.15)] sticky top-24">
                <h3 className="text-lg font-bold text-white mb-1">Interested in This Space?</h3>
                <p className="text-sm text-gray-400 mb-6">Our team responds within one business day. Inquire today to schedule a tour.</p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="text-white font-medium">{property.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Size</span>
                    <span className="text-white font-medium">{property.sqft} sqft</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className="text-[#4ADE80] font-medium">{property.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Market</span>
                    <span className="text-white font-medium">{property.city}</span>
                  </div>
                </div>

                <a href={COMPANY.phoneHref} className="btn-primary w-full justify-center mb-3">
                  <Phone size={16} /> Call {COMPANY.phone}
                </a>
                <Link href="/contact" className="btn-secondary w-full justify-center mb-4">
                  Send Inquiry <ArrowRight size={16} />
                </Link>
                <LeaseBotTrigger propertyName={property.name} variant="detail" />

                <p className="text-center text-xs text-gray-600 mt-4">
                  {COMPANY.email}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Other properties */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[rgba(74,222,128,0.08)] bg-[#0D1117]/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-black text-white mb-8">Other Available Properties</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PROPERTIES.filter((p) => p.id !== property.id).slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  href={`/properties/${p.id}`}
                  className="group glass rounded-xl overflow-hidden border border-[rgba(74,222,128,0.08)] hover:border-[rgba(74,222,128,0.25)] transition-all"
                >
                  <div className="relative h-36 bg-[#111827]">
                    {(p as any).image && (
                      <Image src={(p as any).image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/60 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#4ADE80] transition-colors">{p.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{p.city} · {p.sqft} sqft</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
