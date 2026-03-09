import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Phone } from "lucide-react";
import { mockAgents } from "@/lib/mockData";
import { safeGetAllAgents, loc } from "@/lib/propertyUtils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "agents" });
  return { title: `${t("title")} | Sweet Estate` };
}

export default async function AgentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("agents");

  const sanity = await safeGetAllAgents(locale);
  const agents = sanity.length > 0 ? sanity : mockAgents;

  return (
    <div className="pt-16 md:pt-[72px] min-h-screen bg-white">
      <div className="bg-[#f8f8f8] border-b border-[#ebebeb]">
        <div className="container-site py-10 md:py-14 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#171717] mb-2">{t("title")}</h1>
          <p className="text-[#6b7280] text-sm md:text-base max-w-md mx-auto">{t("subtitle")}</p>
        </div>
      </div>

      <div className="container-site py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
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
                  <strong className="text-[#171717]">{agent.listings.length}</strong>{" "}
                  {t("listings")}
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
                  aria-label={t("contact")}
                >
                  <Phone size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
