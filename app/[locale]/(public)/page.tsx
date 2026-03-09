import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Search, MapPin, ChevronRight, ArrowRight, Phone } from "lucide-react";
import PropertyCard from "@/components/properties/PropertyCard";
import { mockProperties, mockAgents } from "@/lib/mockData";
import {
  safeGetFeaturedProperties,
  safeGetAllAgents,
  toCardProps,
  loc,
} from "@/lib/propertyUtils";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: `Sweet Estate — ${t("hero_title")}` };
}

// ─── Static data (not locale-dependent) ──────────────────────────────────────

const stats = [
  { value: "12,000+", labelKey: "stats_properties" },
  { value: "8,400+", labelKey: "stats_clients" },
  { value: "15+", labelKey: "stats_experience" },
  { value: "98%", labelKey: "stats_satisfaction" },
];

const propertyTypes = [
  {
    labelKey: "type_sale",
    count: "1,240+",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
    href: "/properties?type=residential_sale" as const,
  },
  {
    labelKey: "type_rental",
    count: "3,580+",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    href: "/rentals" as const,
  },
  {
    labelKey: "type_luxury",
    count: "420+",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
    href: "/properties?type=luxury" as const,
  },
  {
    labelKey: "type_commercial",
    count: "270+",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    href: "/commercial" as const,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");
  const tProp = await getTranslations("property");

  // Fetch featured properties — fall back to mock if Sanity unavailable / empty
  const sanityProps = await safeGetFeaturedProperties(locale);
  const featuredRaw =
    sanityProps.length > 0
      ? sanityProps
      : mockProperties.filter((p) => p.status === "available").slice(0, 6);
  const featuredProperties = featuredRaw.map((p) => toCardProps(p, locale));

  // Fetch agents — fall back to mock
  const sanityAgents = await safeGetAllAgents(locale);
  const agents = sanityAgents.length > 0 ? sanityAgents : mockAgents;

  const statLabels = [
    "Properties Listed",
    "Happy Clients",
    "Years Experience",
    "Satisfaction Rate",
  ];

  return (
    <>
      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1800&q=80"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        <div className="relative z-10 container-site pt-24 pb-16 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-6 text-xs font-semibold text-white/80 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#78afcf]" />
            Trusted by 8,400+ happy clients
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6 max-w-4xl">
            {t("hero_title")}
          </h1>

          <p className="text-base md:text-lg text-white/65 mb-10 max-w-xl leading-relaxed">
            {t("hero_subtitle")}
          </p>

          {/* Search Bar — links to properties with city param */}
          <form
            method="GET"
            action={`/${locale}/properties`}
            className="w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_16px_64px_0_rgba(0,0,0,0.3)] p-2"
          >
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-[#f8f8f8] rounded-xl">
                <MapPin size={16} className="text-[#78afcf] flex-shrink-0" />
                <input
                  type="text"
                  name="city"
                  placeholder={t("hero_search_placeholder")}
                  className="flex-1 bg-transparent text-sm text-[#171717] placeholder:text-[#6b7280] outline-none"
                />
              </div>

              <select
                name="type"
                className="px-4 py-3 bg-[#f8f8f8] rounded-xl text-sm text-[#333] outline-none cursor-pointer min-w-[160px]"
              >
                <option value="">{tProp("filter_type_all")}</option>
                <option value="residential_sale">{tProp("type_sale")}</option>
                <option value="residential_rental">{tProp("type_rental")}</option>
                <option value="luxury">{tProp("type_luxury")}</option>
                <option value="commercial">{tProp("type_commercial")}</option>
              </select>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#171717] hover:bg-[#333] text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Search size={16} />
                <span>Search</span>
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["Barcelona", "Paris", "Madrid", "Lisbon", "Lyon"].map((city) => (
              <Link
                key={city}
                href={`/properties?city=${city}`}
                className="px-3 py-1.5 text-xs font-medium text-white/70 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors backdrop-blur-sm"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce">
          <span className="text-xs text-white/40">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════ */}
      <section className="bg-[#f8f8f8] border-y border-[#ebebeb]">
        <div className="container-site py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value }, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#171717] mb-1">{value}</div>
                <div className="text-xs text-[#6b7280] font-medium">{statLabels[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED LISTINGS
      ══════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container-site">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold text-[#78afcf] uppercase tracking-widest mb-2 block">
                Featured Properties
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#171717] leading-tight">
                {t("featured_title")}
              </h2>
              <p className="text-[#6b7280] mt-2 max-w-md text-sm md:text-base">
                {t("featured_subtitle")}
              </p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171717] hover:text-[#78afcf] transition-colors group"
            >
              {t("cta_button")}
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.slug} {...property} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROPERTY TYPES
      ══════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#f8f8f8]">
        <div className="container-site">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-[#78afcf] uppercase tracking-widest mb-2 block">
              Explore by Type
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#171717]">
              Find your property type
            </h2>
            <p className="text-[#6b7280] mt-2 text-sm md:text-base">
              Browse our curated selection across every category.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {propertyTypes.map(({ labelKey, count, image, href }) => (
              <Link
                key={labelKey}
                href={href}
                className="group relative overflow-hidden rounded-xl aspect-[3/4] block"
              >
                <img
                  src={image}
                  alt={tProp(labelKey as Parameters<typeof tProp>[0])}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <div className="text-sm font-bold text-white mb-0.5">
                    {tProp(labelKey as Parameters<typeof tProp>[0])}
                  </div>
                  <div className="text-xs text-white/60">{count} listings</div>
                </div>
                <div className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={13} className="text-white" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          AGENTS SECTION
      ══════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container-site">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold text-[#78afcf] uppercase tracking-widest mb-2 block">
                Our Team
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#171717]">
                Meet our expert agents
              </h2>
              <p className="text-[#6b7280] mt-2 max-w-md text-sm md:text-base">
                Experienced, trusted, and dedicated to finding you the perfect property.
              </p>
            </div>
            <Link
              href="/agents"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171717] hover:text-[#78afcf] transition-colors group"
            >
              {tNav("agents")}
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.slice(0, 3).map((agent) => (
              <div
                key={agent.id}
                className="bg-white border border-[#ebebeb] rounded-xl p-6 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={agent.photo}
                    alt={agent.name}
                    className="w-14 h-14 rounded-xl object-cover border border-[#ebebeb]"
                  />
                  <div>
                    <div className="font-semibold text-[#171717] text-sm">{agent.name}</div>
                    <div className="text-xs text-[#6b7280]">{loc(agent.title, locale)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-xs text-[#6b7280]">
                  <span>
                    <strong className="text-[#171717]">{agent.listings.length}</strong> Listings
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/agents/${agent.slug}`}
                    className="flex-1 py-2 text-xs font-semibold text-center text-[#171717] border border-[#ebebeb] rounded-lg hover:border-[#171717] transition-colors"
                  >
                    View Profile
                  </Link>
                  <a
                    href={`tel:${agent.phone}`}
                    className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#ebebeb] text-[#6b7280] hover:text-[#171717] hover:border-[#171717] transition-colors"
                  >
                    <Phone size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#171717]">
        <div className="container-site">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e2a35] to-[#0d1a24] px-8 py-14 md:px-16 md:py-20 text-center">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#78afcf]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#78afcf]/10 rounded-full blur-3xl pointer-events-none" />

            <span className="relative inline-block text-xs font-semibold text-[#78afcf] uppercase tracking-widest mb-4">
              Get Started Today
            </span>
            <h2 className="relative text-3xl md:text-5xl font-bold text-white mb-4 max-w-2xl mx-auto leading-tight">
              {t("cta_title")}
            </h2>
            <p className="relative text-white/50 text-sm md:text-base mb-8 max-w-lg mx-auto leading-relaxed">
              Join thousands of satisfied clients who found their perfect home with Sweet Estate. Our
              expert team is ready to guide you every step of the way.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/properties"
                className="px-8 py-3.5 text-sm font-semibold text-[#171717] bg-white rounded-xl hover:bg-[#f8f8f8] transition-colors"
              >
                {t("cta_button")}
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3.5 text-sm font-semibold text-white border border-white/25 rounded-xl hover:border-white/50 transition-colors"
              >
                {tNav("contact")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
