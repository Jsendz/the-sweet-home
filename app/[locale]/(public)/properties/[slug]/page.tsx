import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Bed, Bath, Maximize2, MapPin, Heart, Share2,
  ChevronLeft, ChevronRight, Phone, Mail, Calendar, Check, ArrowLeft,
} from "lucide-react";
import InquiryForm from "@/components/InquiryForm";
import { mockProperties } from "@/lib/mockData";
import { safeGetPropertyBySlug, loc } from "@/lib/propertyUtils";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  const sanity = await safeGetPropertyBySlug(slug, locale);
  const property =
    sanity ??
    mockProperties.find((p) => p.slug === slug) ??
    null;

  if (!property) return { title: "Property not found | Sweet Estate" };

  const title = loc(property.title, locale);
  return {
    title: `${title} | Sweet Estate`,
    description: loc(property.description, locale).slice(0, 160),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const t = await getTranslations("property");
  const tInquiry = await getTranslations("inquiry");

  // Fetch from Sanity; fall back to mock
  const sanity = await safeGetPropertyBySlug(slug, locale);
  const property =
    sanity ??
    (mockProperties.find((p) => p.slug === slug) ?? null);

  if (!property) notFound();

  const title = loc(property.title, locale);
  const description = loc(property.description, locale);
  const features = (property.features as unknown[]).map((f) =>
    typeof f === "string" ? f : loc(f as Parameters<typeof loc>[0], locale),
  );

  // Status label from translations
  const statusLabel: Record<string, string> = {
    available: t("status_available"),
    under_offer: t("status_under_offer"),
    sold: t("status_sold"),
    rented: t("status_rented"),
  };

  // Type label
  const typeLabel: Record<string, string> = {
    residential_sale: t("type_sale"),
    residential_rental: t("type_rental"),
    commercial: t("type_commercial"),
    luxury: t("type_luxury"),
  };

  const images = property.images as string[];
  const mainImage = images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80";
  const thumbImages = images.slice(1, 5);

  const agentTitle = loc(property.agent.title, locale);

  return (
    <div className="pt-16 md:pt-[72px] bg-white min-h-screen">
      {/* ── Breadcrumb ── */}
      <div className="bg-[#f8f8f8] border-b border-[#ebebeb]">
        <div className="container-site py-4">
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <Link href="/" className="hover:text-[#171717] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/properties" className="hover:text-[#171717] transition-colors">Properties</Link>
            <ChevronRight size={12} />
            <span className="text-[#171717] font-medium truncate max-w-[200px]">{title}</span>
          </div>
        </div>
      </div>

      <div className="container-site py-8 md:py-10">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#171717] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to listings
        </Link>

        {/* ── Image Gallery ── */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden mb-8 h-[400px] md:h-[520px]">
          {/* Main image */}
          <div className="col-span-4 md:col-span-2 row-span-2 relative">
            <img src={mainImage} alt={title} className="w-full h-full object-cover" />
            <button className="md:hidden absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-md">
              <ChevronLeft size={16} />
            </button>
            <button className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-md">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Thumbnails — desktop */}
          {thumbImages.length > 0
            ? thumbImages.map((src, i) => (
                <div key={i} className="hidden md:block relative overflow-hidden bg-[#f8f8f8]">
                  <img
                    src={src}
                    alt={`Photo ${i + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {i === 3 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        +{images.length - 5} Photos
                      </span>
                    </div>
                  )}
                </div>
              ))
            : Array.from({ length: Math.min(4, 4 - thumbImages.length) }).map((_, i) => (
                <div key={i} className="hidden md:block bg-[#f8f8f8]" />
              ))}
        </div>

        {/* ── Main Content + Sidebar ── */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left ── */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-[#171717] text-white rounded-md">
                    {statusLabel[property.status] ?? property.status}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-medium bg-[#f8f8f8] text-[#333] border border-[#ebebeb] rounded-md">
                    {typeLabel[property.type] ?? property.type}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#171717] leading-tight mb-2">
                  {title}
                </h1>
                <div className="flex items-center gap-1.5 text-sm text-[#6b7280]">
                  <MapPin size={14} className="text-[#78afcf]" />
                  {property.address}, {property.city}, {property.country}
                </div>
              </div>

              {/* Price + Actions */}
              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#171717]">{property.priceLabel}</div>
                  {property.squareMeters > 0 && property.price > 0 && (
                    <div className="text-xs text-[#6b7280]">
                      €{Math.round(property.price / property.squareMeters).toLocaleString()} / {t("sqm")}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6b7280] border border-[#ebebeb] rounded-lg hover:border-[#171717] hover:text-[#171717] transition-colors">
                    <Share2 size={13} />
                    Share
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6b7280] border border-[#ebebeb] rounded-lg hover:border-rose-300 hover:text-rose-500 transition-colors">
                    <Heart size={13} />
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-px bg-[#ebebeb] rounded-xl overflow-hidden mb-8">
              {[
                { icon: Bed, label: t("bedrooms"), value: String(property.bedrooms) },
                { icon: Bath, label: t("bathrooms"), value: String(property.bathrooms) },
                { icon: Maximize2, label: t("sqm"), value: `${property.squareMeters} ${t("sqm")}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex-1 min-w-[100px] bg-white px-4 py-4 text-center">
                  <Icon size={18} className="text-[#78afcf] mx-auto mb-1.5" />
                  <div className="text-sm font-bold text-[#171717]">{value}</div>
                  <div className="text-xs text-[#6b7280]">{label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#171717] mb-3">{t("description")}</h2>
              <p className="text-sm text-[#6b7280] leading-relaxed">{description}</p>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#171717] mb-4">{t("features")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check size={13} className="text-[#78afcf] flex-shrink-0" />
                      <span className="text-xs text-[#6b7280]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Details Table */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#171717] mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[#ebebeb] rounded-xl overflow-hidden">
                {[
                  { label: "Type", value: typeLabel[property.type] ?? property.type },
                  { label: "Status", value: statusLabel[property.status] ?? property.status },
                  { label: "City", value: property.city },
                  { label: "Country", value: property.country },
                  { label: "Postcode", value: property.postcode },
                  { label: "Floor Area", value: `${property.squareMeters} m²` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white px-4 py-3">
                    <div className="text-xs text-[#6b7280] mb-0.5">{label}</div>
                    <div className="text-sm font-semibold text-[#171717]">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#171717] mb-4">Location</h2>
              <div className="w-full h-64 bg-[#f8f8f8] border border-[#ebebeb] rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#6b7280]">
                  <MapPin size={32} className="text-[#78afcf] mb-2" />
                  <span className="text-sm font-medium">{property.address}, {property.city}</span>
                  <span className="text-xs mt-1 text-[#6b7280]">
                    {property.coordinates.lat.toFixed(4)}, {property.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-[100px] flex flex-col gap-5">
              {/* Agent Card */}
              <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#ebebeb]">
                  <img
                    src={property.agent.photo}
                    alt={property.agent.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#ebebeb]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#171717]">{property.agent.name}</div>
                    <div className="text-xs text-[#6b7280]">{agentTitle}</div>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-[#171717] rounded-xl hover:bg-[#333] transition-colors"
                  >
                    <Phone size={13} />
                    {t("contact_agent")}
                  </a>
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[#171717] border border-[#ebebeb] rounded-xl hover:border-[#171717] transition-colors"
                  >
                    <Mail size={13} />
                    Email
                  </a>
                </div>

                <div className="bg-[#f8f8f8] rounded-lg px-3 py-2 text-center">
                  <span className="text-xs text-[#6b7280]">Ref: </span>
                  <span className="text-xs font-semibold text-[#171717]">{property.slug}</span>
                </div>
              </div>

              {/* Inquiry Form */}
              <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
                <h3 className="text-sm font-bold text-[#171717] mb-4">{tInquiry("title")}</h3>
                <InquiryForm propertySlug={property.slug} locale={locale} />
              </div>

              {/* Schedule Viewing */}
              <div className="bg-[#f8f8f8] border border-[#ebebeb] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={15} className="text-[#78afcf]" />
                  <h3 className="text-sm font-bold text-[#171717]">{tInquiry("viewing_date")}</h3>
                </div>
                <p className="text-xs text-[#6b7280] mb-3 leading-relaxed">
                  Available Monday – Saturday, 9am – 6pm.
                </p>
                <Link
                  href="/contact"
                  className="block w-full py-2.5 text-xs font-semibold text-center text-[#171717] border border-[#171717] rounded-xl hover:bg-[#171717] hover:text-white transition-colors"
                >
                  Book a Viewing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
