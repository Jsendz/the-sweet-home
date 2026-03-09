import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, ArrowLeft } from "lucide-react";
import PropertyCard from "@/components/properties/PropertyCard";
import { mockAgents } from "@/lib/mockData";
import { safeGetAgentBySlug, toCardProps, loc } from "@/lib/propertyUtils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const sanity = await safeGetAgentBySlug(slug, locale);
  const agent = sanity ?? mockAgents.find((a) => a.slug === slug) ?? null;
  if (!agent) return { title: "Agent not found | Sweet Estate" };
  return { title: `${agent.name} | Sweet Estate` };
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("agents");

  const sanity = await safeGetAgentBySlug(slug, locale);
  const agent = sanity ?? (mockAgents.find((a) => a.slug === slug) ?? null);

  if (!agent) notFound();

  const title = loc(agent.title, locale);
  const bio = loc(agent.bio, locale);
  const listings = agent.listings.map((p) => toCardProps(p, locale));

  return (
    <div className="pt-16 md:pt-[72px] min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-[#f8f8f8] border-b border-[#ebebeb]">
        <div className="container-site py-4">
          <Link
            href="/agents"
            className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#171717] transition-colors"
          >
            <ArrowLeft size={14} />
            {t("title")}
          </Link>
        </div>
      </div>

      <div className="container-site py-10">
        {/* Agent header */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {/* Card */}
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="bg-white border border-[#ebebeb] rounded-xl p-6 text-center">
              <img
                src={agent.photo}
                alt={agent.name}
                className="w-24 h-24 rounded-xl object-cover border border-[#ebebeb] mx-auto mb-4"
              />
              <h1 className="text-lg font-bold text-[#171717] mb-1">{agent.name}</h1>
              <p className="text-sm text-[#6b7280] mb-4">{title}</p>

              <div className="text-sm text-[#6b7280] mb-5">
                <strong className="text-[#171717]">{listings.length}</strong>{" "}
                {t("listings")}
              </div>

              <div className="flex gap-2">
                <a
                  href={`tel:${agent.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-[#171717] rounded-xl hover:bg-[#333] transition-colors"
                >
                  <Phone size={13} />
                  {t("contact")}
                </a>
                <a
                  href={`mailto:${agent.email}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[#171717] border border-[#ebebeb] rounded-xl hover:border-[#171717] transition-colors"
                >
                  <Mail size={13} />
                  Email
                </a>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#171717] mb-4">About {agent.name}</h2>
            <p className="text-sm text-[#6b7280] leading-relaxed">{bio}</p>
          </div>
        </div>

        {/* Listings */}
        {listings.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#171717] mb-6">
              {agent.name}&apos;s Listings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((property) => (
                <PropertyCard key={property.slug} {...property} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
