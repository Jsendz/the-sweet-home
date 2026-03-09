import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Search, SlidersHorizontal, MapPin, LayoutGrid, ChevronDown } from "lucide-react";
import PropertyCard from "@/components/properties/PropertyCard";
import { mockProperties } from "@/lib/mockData";
import { safeGetAllProperties, toCardProps } from "@/lib/propertyUtils";
import type { Property } from "@/types";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "properties" });
  return { title: `${t("title")} | Sweet Estate` };
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

function filterProperties(
  properties: Property[],
  filters: {
    type?: string;
    status?: string;
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
  },
): Property[] {
  return properties.filter((p) => {
    if (filters.type && p.type !== filters.type) return false;
    if (filters.status && p.status !== filters.status) return false;
    if (filters.city) {
      const q = filters.city.toLowerCase();
      if (!p.city.toLowerCase().includes(q) && !p.address.toLowerCase().includes(q))
        return false;
    }
    if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
    if (filters.bedrooms && p.bedrooms < Number(filters.bedrooms)) return false;
    return true;
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const getString = (key: string) =>
    Array.isArray(sp[key]) ? sp[key][0] : (sp[key] as string | undefined);

  const filters = {
    type: getString("type"),
    status: getString("status"),
    city: getString("city"),
    minPrice: getString("minPrice"),
    maxPrice: getString("maxPrice"),
    bedrooms: getString("bedrooms"),
  };

  const t = await getTranslations("properties");
  const tProp = await getTranslations("property");

  // Fetch from Sanity; fall back to all mock properties
  const allProperties = await safeGetAllProperties(locale);
  const sourceProperties = allProperties.length > 0 ? allProperties : mockProperties;

  // Apply filters server-side
  const filtered = filterProperties(sourceProperties as Property[], filters);
  const listings = filtered.map((p) => toCardProps(p, locale));

  const bedroomOptions = ["1", "2", "3", "4", "5"];

  // Build a clean URL for "clear filters"
  const clearUrl = `/${locale}/properties`;

  return (
    <div className="pt-16 md:pt-[72px] min-h-screen bg-white">
      {/* ── Page Header ── */}
      <div className="bg-[#f8f8f8] border-b border-[#ebebeb]">
        <div className="container-site py-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-[#171717] mb-1">{t("title")}</h1>
          <p className="text-sm text-[#6b7280]">
            {t("results_showing", { count: listings.length })}
          </p>
        </div>
      </div>

      {/* ── Sticky Filter Bar (GET form — works without JS) ── */}
      <div className="sticky top-16 md:top-[72px] z-30 bg-white border-b border-[#ebebeb] shadow-[0_1px_8px_0_rgba(0,0,0,0.04)]">
        <form method="GET" action={`/${locale}/properties`}>
          <div className="container-site py-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* City search */}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f8f8f8] border border-[#ebebeb] rounded-lg flex-1 min-w-0">
                <Search size={14} className="text-[#6b7280] flex-shrink-0" />
                <input
                  type="text"
                  name="city"
                  defaultValue={filters.city ?? ""}
                  placeholder={t("filter_city_placeholder")}
                  className="flex-1 bg-transparent text-sm text-[#171717] placeholder:text-[#6b7280] outline-none min-w-0"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Property Type */}
                <div className="relative">
                  <select
                    name="type"
                    defaultValue={filters.type ?? ""}
                    className="appearance-none pl-3 pr-7 py-2.5 text-xs font-medium text-[#333] bg-[#f8f8f8] border border-[#ebebeb] rounded-lg outline-none cursor-pointer"
                  >
                    <option value="">{t("filter_type_all")}</option>
                    <option value="residential_sale">{tProp("type_sale")}</option>
                    <option value="residential_rental">{tProp("type_rental")}</option>
                    <option value="luxury">{tProp("type_luxury")}</option>
                    <option value="commercial">{tProp("type_commercial")}</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
                </div>

                {/* Bedrooms */}
                <div className="relative">
                  <select
                    name="bedrooms"
                    defaultValue={filters.bedrooms ?? ""}
                    className="appearance-none pl-3 pr-7 py-2.5 text-xs font-medium text-[#333] bg-[#f8f8f8] border border-[#ebebeb] rounded-lg outline-none cursor-pointer"
                  >
                    <option value="">{t("filter_bedrooms")}: Any</option>
                    {bedroomOptions.map((b) => (
                      <option key={b} value={b}>{b}+ {t("filter_bedrooms")}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
                </div>

                {/* Submit / More Filters */}
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-white bg-[#171717] rounded-lg hover:bg-[#333] transition-colors"
                >
                  <SlidersHorizontal size={13} />
                  {t("filter_apply")}
                </button>

                {/* Clear */}
                {Object.values(filters).some(Boolean) && (
                  <a
                    href={clearUrl}
                    className="text-xs font-medium text-[#78afcf] hover:underline px-2"
                  >
                    {t("filter_clear")}
                  </a>
                )}

                {/* View Toggle */}
                <span className="w-px h-5 bg-[#ebebeb]" />
                <div className="flex items-center bg-[#f8f8f8] border border-[#ebebeb] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    aria-label={t("view_grid")}
                    className="px-3 py-2.5 text-[#171717] bg-white border-r border-[#ebebeb]"
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ── Main Content ── */}
      <div className="container-site py-8 md:py-10">
        <div className="flex gap-8">
          {/* ── Sidebar Filter Panel ── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <form method="GET" action={`/${locale}/properties`}>
              <div className="bg-white border border-[#ebebeb] rounded-xl p-5 sticky top-[132px]">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-[#171717]">{t("filters_title")}</h2>
                  <a href={clearUrl} className="text-xs text-[#78afcf] hover:underline">
                    {t("filter_clear")}
                  </a>
                </div>

                {/* Status */}
                <FilterGroup label={t("filter_status")}>
                  <div className="flex flex-col gap-2">
                    {(
                      [
                        { value: "available", label: tProp("status_available") },
                        { value: "under_offer", label: tProp("status_under_offer") },
                        { value: "sold", label: tProp("status_sold") },
                        { value: "rented", label: tProp("status_rented") },
                      ] as const
                    ).map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="status"
                          value={value}
                          defaultChecked={filters.status === value}
                          className="accent-[#78afcf]"
                        />
                        <span className="text-sm text-[#333] group-hover:text-[#171717]">{label}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        value=""
                        defaultChecked={!filters.status}
                        className="accent-[#78afcf]"
                      />
                      <span className="text-sm text-[#333] group-hover:text-[#171717]">Any</span>
                    </label>
                  </div>
                </FilterGroup>

                {/* Property Type */}
                <FilterGroup label={t("filter_type")}>
                  <div className="flex flex-col gap-2">
                    {(
                      [
                        { value: "residential_sale", label: tProp("type_sale") },
                        { value: "residential_rental", label: tProp("type_rental") },
                        { value: "luxury", label: tProp("type_luxury") },
                        { value: "commercial", label: tProp("type_commercial") },
                      ] as const
                    ).map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="type"
                          value={value}
                          defaultChecked={filters.type === value}
                          className="accent-[#78afcf]"
                        />
                        <span className="text-sm text-[#333] group-hover:text-[#171717]">{label}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="type"
                        value=""
                        defaultChecked={!filters.type}
                        className="accent-[#78afcf]"
                      />
                      <span className="text-sm text-[#333] group-hover:text-[#171717]">Any</span>
                    </label>
                  </div>
                </FilterGroup>

                {/* Price Range */}
                <FilterGroup label={t("filter_price")}>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      defaultValue={filters.minPrice ?? ""}
                      placeholder="Min €"
                      className="flex-1 px-3 py-2 text-xs bg-[#f8f8f8] border border-[#ebebeb] rounded-lg outline-none focus:border-[#78afcf] transition-colors"
                    />
                    <span className="text-[#6b7280] self-center text-xs">–</span>
                    <input
                      type="number"
                      name="maxPrice"
                      defaultValue={filters.maxPrice ?? ""}
                      placeholder="Max €"
                      className="flex-1 px-3 py-2 text-xs bg-[#f8f8f8] border border-[#ebebeb] rounded-lg outline-none focus:border-[#78afcf] transition-colors"
                    />
                  </div>
                </FilterGroup>

                {/* Bedrooms */}
                <FilterGroup label={t("filter_bedrooms")}>
                  <div className="grid grid-cols-3 gap-2">
                    {["Any", ...bedroomOptions].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {}}
                        name="bedrooms"
                        value={b === "Any" ? "" : b}
                        className={`py-2 text-xs font-medium border rounded-lg transition-colors ${
                          (b === "Any" && !filters.bedrooms) || filters.bedrooms === b
                            ? "border-[#78afcf] text-[#78afcf] bg-[#78afcf]/5"
                            : "text-[#333] bg-[#f8f8f8] border-[#ebebeb] hover:border-[#78afcf]"
                        }`}
                      >
                        {b === "Any" ? b : `${b}+`}
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                {/* Location */}
                <FilterGroup label={t("filter_city")} noBorder>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f8f8f8] border border-[#ebebeb] rounded-lg">
                    <MapPin size={13} className="text-[#6b7280]" />
                    <input
                      type="text"
                      name="city"
                      defaultValue={filters.city ?? ""}
                      placeholder={t("filter_city_placeholder")}
                      className="flex-1 bg-transparent text-xs text-[#171717] placeholder:text-[#6b7280] outline-none"
                    />
                  </div>
                </FilterGroup>

                <button
                  type="submit"
                  className="w-full mt-5 py-3 text-sm font-semibold text-white bg-[#171717] rounded-xl hover:bg-[#333] transition-colors"
                >
                  {t("filter_apply")}
                </button>
              </div>
            </form>
          </aside>

          {/* ── Listings Grid ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-[#6b7280]">
                <strong className="text-[#171717]">{listings.length}</strong>{" "}
                {t("results_count")}
              </p>
            </div>

            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-lg font-semibold text-[#171717] mb-2">{t("no_results")}</p>
                <a href={clearUrl} className="text-sm text-[#78afcf] hover:underline">
                  {t("filter_clear")}
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {listings.map((property) => (
                  <PropertyCard key={property.slug} {...property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Filter Group Sub-component ── */
function FilterGroup({
  label,
  children,
  noBorder,
}: {
  label: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div className={`py-4 ${!noBorder ? "border-b border-[#ebebeb]" : ""}`}>
      <h3 className="text-xs font-semibold text-[#171717] mb-3">{label}</h3>
      {children}
    </div>
  );
}
