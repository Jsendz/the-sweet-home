import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PropertyCard from "@/components/properties/PropertyCard";
import { mockProperties } from "@/lib/mockData";
import { safeGetPropertiesByType, toCardProps } from "@/lib/propertyUtils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: `${t("rentals")} | Sweet Estate` };
}

export default async function RentalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("nav");
  const tProp = await getTranslations("properties");

  const sanity = await safeGetPropertiesByType("residential_rental", locale);
  const sourceProperties =
    sanity.length > 0
      ? sanity
      : mockProperties.filter((p) => p.type === "residential_rental");

  const listings = sourceProperties.map((p) => toCardProps(p, locale));

  return (
    <div className="pt-16 md:pt-[72px] min-h-screen bg-white">
      <div className="bg-[#f8f8f8] border-b border-[#ebebeb]">
        <div className="container-site py-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-[#171717] mb-1">{t("rentals")}</h1>
          <p className="text-sm text-[#6b7280]">
            <strong className="text-[#171717]">{listings.length}</strong>{" "}
            {tProp("results_count")}
          </p>
        </div>
      </div>

      <div className="container-site py-8 md:py-10">
        {listings.length === 0 ? (
          <p className="text-center text-[#6b7280] py-24">{tProp("no_results")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((property) => (
              <PropertyCard key={property.slug} {...property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
